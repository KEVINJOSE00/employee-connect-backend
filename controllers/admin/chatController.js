const users = []

const addUser = ({id, username, room}) =>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    
    if(!username || !room) {
        return {
            error : 'Username and room are required'
        }
    }

    //check for existing user

    const existingUser = users.find(() =>{
        return user.room == room && username === username
    })

    // validate username 
    if(existingUser) {
        return {
            error: 'username is in use!'
        }
    }

    //store user
    const user = {id, username , room}
    users.push(user)
    return { user }
}


const removeUser = (id) =>{
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }

}

const getUser = (id) =>{
    return users.find((user) => user.id === id)

}

const getUsersInRoom = (room) => {
    return users.filter((user) => users.room === room)
}


module.exports = {
    addUser, 
    removeUser,
    getUser, 
    getUsersInRoom
}