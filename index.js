const { ApolloServer} = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const conectarDB = require('./config/db');
//const cors = require('cors');
const jwt = require('jsonwebtoken');
conectarDB();


const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        
        const token = req.headers['authorization'] || '';
        
        if(token){
            try {
                const usuario = jwt.verify(token.replace('Bearer ',''), process.env.SECRETA);
                return usuario
            } catch (error) {
                console.log(error);  
            }
        }
    },
    cors: {
        origin: ['http://localhost:3000', 'https://parchis-app.onrender.com'],
        credentials: true
    }
});



/*eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZjIwZDQ4Nzg0YWM5MDQxN2M3NjBiOSIsIm5vbWJyZSI6IkVyaWMiLCJhcGVsbGlkb3MiOiJBZ3VpbGFyIE1hcmNpYWwiLCJlbWFpbCI6ImVyaWMuYWd1aW1hckBnbWFpbC5jb20iLCJzdGF0dXMiOiJBQ1RJVk8iLCJyb2wiOiJBRE1JTklTVFJBRE9SIiwiaWF0IjoxNjI2NDgxMzQwLCJleHAiOjE2Mjg5MDA1NDB9.EBbHEA3Je5I-T8kTbJGA05NsZuCh8WO7lkj_Ub8AVAE */
server.listen().then( ({url}) => {
    console.log(`Servidor listo en la url: ${url}`);
})