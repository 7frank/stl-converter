import * as socketServer from 'socket.io';


/***************************************************************************************** */

/* Socket logic starts here																   */
/***************************************************************************************** */

export function queuesSocket(server, namespace = '/queues', onConnect: (socket: socketServer.Socket) => any) {
    const io = socketServer(server);
    const nsp = io.of(namespace)
    const connections = [];


    nsp.on('connection', function (socket) {

        onConnect(socket)

        console.log("Connected to Socket!!" + socket.id)
        connections.push(socket)
        socket.on('disconnect', function () {
            console.log('Disconnected - ' + socket.id);
        });

        socket.emit('connection', "client connected")


        //  socket.emit('data', [{id:1,name:'test123123.stl',progress:0.5},{id:3,name:'testqwe123.stl',progress:0},{id:3,name:'testasd123.stl',progress:0.2}])


        /*  socket.on('progress', (addData) => {
              var todoItem = {
                  itemId: addData.id,
                  item: addData.item,
                  completed: addData.completed
              }




              nsp.emit('progress', addData)

                      console.log({message: "+++Gethyl ADD NEW ITEM worked!!"})

          })
          */

    });


}