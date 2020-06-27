<?php require __DIR__.'/vendor/autoload.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

include ('config.php');

class ServerImpl implements MessageComponentInterface {
    protected $clients;
    private $_db;

    public function __construct($db) {
        $this->clients = new \SplObjectStorage;
        $this->setDb($db);
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "New connection! ({$conn->resourceId}).\n";
        
        $q2 = $this->_db->query('SELECT click FROM abacus');
        $donnees = $q2->fetch(PDO::FETCH_ASSOC);

        foreach ($this->clients as $client) {
            if ($conn === $client) {
                $client->send($donnees['click']);
                break;
            }
        }
    }

    public function onMessage(ConnectionInterface $conn, $msg) {
        echo sprintf("New message from '%s': %s\n\n", $conn->resourceId, $msg);
        $q = $this->_db->prepare('UPDATE abacus SET click = click + :click WHERE id = 0');
        $q->bindValue(':click', intVal($msg), PDO::PARAM_INT);
        $q->execute();

        $q2 = $this->_db->query('SELECT click FROM abacus');
        $donnees = $q2->fetch(PDO::FETCH_ASSOC);

        foreach ($this->clients as $client) {
            $client->send($donnees['click']);
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        echo "Connection {$conn->resourceId} is gone.\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error occured on connection {$conn->resourceId}: {$e->getMessage()}\n\n\n";
        $conn->close();
    }

    public function setDb(PDO $db) {
      $this->_db = $db;
    }
}

try {
    $bdd = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME .';charset=utf8', DB_USER, DB_PWD);
} catch (Exception $e) {
    die("Erreur : " . $e->getMessage() . "\n");
}

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new ServerImpl($bdd)
        )
    ),
    APP_PORT
);
echo "Server created on port " . APP_PORT . "\n\n";
$server->run();