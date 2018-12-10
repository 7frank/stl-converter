import * as socketServer from 'socket.io';


/***************************************************************************************** */
/* Socket logic starts here																   */
/***************************************************************************************** */

export
function queuesSocket(server, namespace ='/queues',onConnect=(socket:any)=>{}) {
    const io = socketServer(server);
    const nsp = io.of(namespace)
    const connections = [];


    nsp.on('connection', function (socket) {
        console.log("Connected to Socket!!" + socket.id)
        connections.push(socket)
        socket.on('disconnect', function () {
            console.log('Disconnected - ' + socket.id);
        });

        /*var cursor = todoModel.find({}, "-_id itemId item completed", (err, result) => {
            if (err) {
                console.log("---Gethyl GET failed!!")
            } else {
                socket.emit('initialList', result)
                console.log("+++Gethyl GET worked!!")
            }
        })
        */
        socket.emit('data', [{id:1,name:'test123123.stl',progress:0.5},{id:3,name:'testqwe123.stl',progress:0},{id:3,name:'testasd123.stl',progress:0.2}])


        socket.on('progress', (addData) => {
            var todoItem = {
                itemId: addData.id,
                item: addData.item,
                completed: addData.completed
            }




            nsp.emit('progress', addData)

                    console.log({message: "+++Gethyl ADD NEW ITEM worked!!"})

        })


        // 		.cursor()
        // cursor.on('data',(res)=> {socket.emit('initialList',res)})
/*
        socket.on('addItem', (addData) => {
            var todoItem = new todoModel({
                itemId: addData.id,
                item: addData.item,
                completed: addData.completed
            })

            todoItem.save((err, result) => {
                if (err) {
                    console.log("---Gethyl ADD NEW ITEM failed!! " + err)
                } else {
                    // connections.forEach((currentConnection)=>{
                    // 	currentConnection.emit('itemAdded',addData)
                    // })
                    io.emit('itemAdded', addData)

                    console.log({message: "+++Gethyl ADD NEW ITEM worked!!"})
                }
            })
        })

        */

        /*
        socket.on('markItem', (markedItem) => {
            var condition = {itemId: markedItem.id},
                updateValue = {completed: markedItem.completed}

            todoModel.update(condition, updateValue, (err, result) => {
                if (err) {
                    console.log("---Gethyl MARK COMPLETE failed!! " + err)
                } else {
                    // connections.forEach((currentConnection)=>{
                    // 	currentConnection.emit('itemMarked',markedItem)
                    // })
                    io.emit('itemMarked', markedItem)

                    console.log({message: "+++Gethyl MARK COMPLETE worked!!"})
                }
            })
        })*/

        onConnect(socket)
    });


}