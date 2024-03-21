const DatabaseEngine = require("./utils/DatabaseEngine");
const Server = require("./server/Server");
const config = require("./config/main.settings");
const Logger = require("./utils/Logger");

let logger = new Logger().getLogger();

main = () => {
  try {
    process.env.TZ = config.infrastructure.timezone;
    let server = new Server(config.server.port);
    server.start();
    
    // let db = new DatabaseEngine();

    // db.connect(async() => {
    //   let server = new Server(config.server.port);
    //   server.start();
    // });

  } catch (e) {
    logger.error(e)
    process.exit(1);
  }
};

main();
