const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
require('dotenv').config({path: 'variables.env'});

const Gamer = require("../models/Gamer");
const General = require('../models/General');
const Question = require("../models/Question");

const blocks = [
    1,
    3,
    8,
    14,
    16,
    21,
    27,
    29,
    34,
    40,
    42,
    47,
]

const crearTokenUsuario = (usuario, secreta, expiresIn) => {
    const {id, name} = usuario;
    return jwt.sign({id,name},secreta, { expiresIn } );

}

const resolvers = {
    Query: {
        getGamers: async(_,{},ctx) => {
            try {
                const gamers = await Gamer.find({});
                /*gamers.forEach(element => {
                    console.log(crearTokenUsuario(element,process.env.SECRETA,'28D'));
                });*/
                return gamers
            } catch (error) {
                throw new Error(error)
            }
        },
        getGamer: async(_,{id},ctx) => {
            try {
                const gamer = await Gamer.findById(id);
                return gamer;
            } catch (error) {
                throw new Error(error)
            }
        },
        getQuestions: async(_,{}, ctx) => {
            try {
                const questions = await Question.find({});
                return questions
            } catch (error) {
                throw new Error(error)
            }
        },
        getQuestion: async(_,{id},ctx) => {
            try {
                const question = await Question.findById(id);
                return question;
            } catch (error) {
                throw new Error(error);
            }
        },
        getRandomQuestion: async(_,{},ctx) => {
            try {
                const random = Math.floor(Math.random() * 5);


                const question = await Question.findOne().skip(random);

                return question;
            } catch (error) {
                throw new Error(Error);
            }
        },
        verifyQuestion: async(_,{input}, ctx) => {
            try {
                const {answer, question} = input;
                const existQuestion = await Question.findById(question);
                if(!existQuestion){
                    throw new Error('La pregunta no existe')
                }
                
                if(existQuestion.correctAnswer == answer){
                    return true
                }
                return false;
            } catch (error) {
                throw new Error(error)
            }
        },
        getGenerals: async(_, {}, ctx) => {
            try {
                const generals = await General.find({}).populate('activeGamer');
                //console.log(generals);
                return generals
            } catch (error) {
                throw new Error(error);
            }
        },
        getActiveGeneral: async(_, {}, ctx) => {
            try {
                const newgeneral = await General.findOne({active: true}).populate('activeGamer');
                //console.log(newgeneral);
                return newgeneral
            } catch (error) {
                throw new Error(error);
            }
        },
        getActiveGeneralGamers: async(_,{},ctx) => {
            try {
                const activeGame = await General.findOne({active: true});
                const gamersIds = activeGame.gamers.map(obj => (obj.id.toString() ));
                //console.log(gamersIds);
                const Gamers = await Gamer.find({ _id: { $in: gamersIds }});
                return Gamers;
            } catch (error) {
                throw new Error(error);
            }
        }

    },
    Mutation: {
        newGamer: async(_,{input},ctx) => {
            const {name} = input;
            const newModelGamer = {
                name,
                pieces: [
                    {
                        number: 1,
                        position: 0
                    },
                    {
                        number: 2,
                        position: 0
                    }
                ]
            }
            const newGamer = new Gamer(newModelGamer);
            newGamer.save();
            return{
                id: newGamer._id,
                token: crearTokenUsuario(newGamer,process.env.SECRETA,'28D')
            }
        },
        updateGamer: async(_,{id, input}, ctx) => {
            try {
                const existGamer = await Gamer.findById(id);
                if(!existGamer){
                    throw new Error('El jugador no existe')
                }


                const newGamer = await Gamer.findByIdAndUpdate({_id: id}, input, {new: true});
                return newGamer;
            } catch (error) {
                throw new Error(error);
            }
        },
        deleteGamer: async(_,{id}, ctx) => {
            try {
                const existGamer = await Gamer.findById(id);
                if(!existGamer){
                    throw new Error('El jugador no existe')
                }

                await Gamer.findByIdAndDelete(id);
                return 'El jugador ha sido eliminado';
            } catch (error) {
                throw new Error(error);
            }
        },
        updatePosition: async(_,{id, input}, ctx) => {
            try {
                let existGamer = await Gamer.findById(id);
                if(!existGamer){
                    throw new Error('El jugador no existe')
                }

                if(input.position > 12 || input.position< 0) {
                    throw new Error('No puedes avanzar ese numero de casillas')
                }

                const index = existGamer.pieces.findIndex(p => p.number === input.number);
                const newPosition = {
                    number: input.number,
                    position: existGamer.pieces[index].position + input.position
                }
                existGamer.pieces[index] = newPosition;

                

                const newGamer = await Gamer.findByIdAndUpdate({_id: id}, existGamer, {new: true});
                return 'piezas actualizadas';
            } catch (error) {
                throw new Error(error);
            }
        },
        updateMyPosition: async(_,{input}, ctx) => {
            //console.log(ctx.name);
            try {
                const {name, id} = ctx;
                let indexUser = 0;

                
                let existGamer = await Gamer.findById(id);
                if(!existGamer){
                    throw new Error('El jugador no existe')
                }

                if(input.position > 12 ) {
                    throw new Error('No puedes avanzar ese numero de casillas')
                }

                const index = existGamer.pieces.findIndex(p => p.number === input.number);
                const newPosition = {
                    number: input.number,
                    position: existGamer.pieces[index].position + input.position
                }
                const lastNumber = existGamer.pieces[index].position;
                const newnumber = existGamer.pieces[index].position + input.position;
                existGamer.pieces[index] = newPosition;

                const activeGame = await General.findOne({active: true});
                const gamersIds = activeGame.gamers.map(obj => (obj.id.toString() ));
                const gamers = await Gamer.find({ _id: { $in: gamersIds }});


                let positions = [];
                gamers.forEach((element, index) => {
                    if(id == element.id){
                        indexUser = index;
                    }
                    element.pieces.forEach(piece => {
                        let tempPosition;
                        switch (index) {
                            case 0:
                                if(piece.position == 0){
                                    tempPosition = piece.number == 1 ? 200 : 201
                                }else{
                                    tempPosition = piece.position
                                }
                                break;
                            case 1:
                                if(piece.position == 0){
                                    tempPosition = piece.number == 1 ? 202 : 203
                                }else{
                                    tempPosition = piece.position > 52 ? piece.position+58 : piece.position+27 > 52 ? piece.position+27-52 : piece.position+27
                                }
                                break
                            case 2:
                                if(piece.position == 0){
                                    tempPosition = piece.number == 1 ? 204 : 205
                                }else{
                                    tempPosition = piece.position > 52 ? piece.position +64 : piece.position+42 > 52 ? piece.position+42-52 : piece.position+42
                                }
                                break
                            case 3:
                                if(piece.position == 0){
                                    tempPosition = piece.number == 1 ? 206 : 207
                                }else{
                                    tempPosition = piece.position > 52 ? piece.position+70 : piece.position+14 > 52 ? piece.position+14-52 : piece.position+14
                                }
                                break
                            default:
                                break;
                        }
                        positions.push({
                            user: index,
                            piece: piece.number,
                            position: tempPosition
                        })
                    }) 
                });
                console.log(positions);
                const samePositions = await positions.filter(position => position.position ==newPosition.position)
                const filteredArr = positions.filter((el, index, self) => {
                    return (el.position >= lastNumber && el.position <= newnumber) && self.findIndex((elem) => elem.position === el.position) !== index;
                });
                if (filteredArr.length >= 2){
                    throw new Error('hay un bloqueo en tu camino')
                }

                if(samePositions.length > 0 && !blocks.includes(newPosition.position)){

                    let loser = gamers[samePositions[0].user];

                        const index = loser.pieces.findIndex(p => p.number === samePositions[0].piece);
                        const newPosition = {
                            number: samePositions[0].piece,
                            position: 0
                        }
                        loser.pieces[index] = newPosition;
                        console.log(loser.id.toString());
                        console.log(loser.pieces);
                        const newLoser = await Gamer.findByIdAndUpdate({_id: loser.id.toString()},{pieces: loser.pieces},{new: true});
                        console.log(newLoser);
                        const newNewPosition = {
                            number: input.number,
                            position: existGamer.pieces[index].position + 10
                        }
                        existGamer.pieces[index] = newNewPosition;
                        console.log(existGamer);
                }
                //57
                if(newPosition.position > 57){
                    const newGen = await General.findOneAndUpdate({active: true}, {winner: id}, {new: true})
                }
                const newGamer = await Gamer.findByIdAndUpdate({_id: id}, existGamer, {new: true});
                return 'piezas actualizadas';
            } catch (error) {
                throw new Error(error);
            }
        },
        newQuestion: async(_,{input}, ctx) => {
            try {
                const newQuestion = new Question(input);
                newQuestion.save();
                return newQuestion
            } catch (error) {
                throw new Error(error);
            }
        },
        updateQuestion: async(_,{id, input}, ctx) => {
            try {
                const existQuestion = await Question.findById(id);
                if(!existQuestion){
                    throw new Error('La pregunta no existe');
                }

                const newQuestion = await Question.findByIdAndUpdate({_id: id}, input, {new: true});
                return newQuestion;
            } catch (error) {
                throw new Error(error)
            }
        },
        deleteQuestion: async(_,{id}, ctx) => {
            try {
                const existQuestion = await Question.findById(id);
                if(!existQuestion){
                    throw new Error('La pregunta no existe');
                }

                await Question.findByIdAndDelete(id);

                return 'La pregunta fue eliminada correctamente'
            } catch (error) {
                throw new Error(error);
            }
        },
        newGeneral: async(_,{input}, ctx) => {
            try {
                const {name} = input;
                const inputGeneral = {
                    name,
                    gamers: [],
                    active: false,
                }

                const newGeneral = new General(inputGeneral);
                newGeneral.save()
                return newGeneral
            } catch (error) {
                throw new Error(error);
            }
        },
        addGamer: async(_,{input}, ctx) => {
            const {gamer, game} = input
            try {
                let general = await General.findById(game);
                if(!general){
                    throw new Error('El juego no existe')
                }
                let existGamer = await Gamer.findById(gamer);
                if(!existGamer){
                    throw new Error(' el jugador no existe');
                }
                existGamer.id = existGamer._id;
                const newExistGamer = {
                    id: existGamer._id,
                    name: existGamer.name,
                    pieces: existGamer.pieces,
                    hits: existGamer.hits
                }
                const newGamers = [...general.gamers, newExistGamer];

                general.gamers = newGamers;

                const newGeneral = await General.findByIdAndUpdate({_id: game}, general, {new: true});
                return newGeneral;

            } catch (error) {
                throw new Error(error);
            }
        },
        deleteGeneral: async(_,{id},ctx) => {
            try {
                const existGeneral = await General.findById(id);

                if(!existGeneral){
                    throw new Error('El juego no existe');
                }

                await General.findByIdAndDelete(id);
                return 'Juego eliminado'
            } catch (error) {
                throw new Error(error);
            }
        },
        startGame: async(_,{id}, ctx) => {
            try {
                let firstgamer = {};
                const existGame = await General.findById(id);
                if(!existGame){
                    throw new Error('El juego no existe');

                }
                /*const gameActives = await General.find({active: true}).count();
                if(gameActives > 0){
                    throw new Error('Ya hay un juego activo')
                }*/
                if(existGame.gamers.length == 0){
                    throw new Error('el juego no tiene jugadores')
                }
                existGame.gamers.forEach(async (item,index) => {
                    if(index == 0){
                        firstgamer = item;
                    }
                    await Gamer.findByIdAndUpdate({_id: item.id}, {pieces: [{number: 1, position: 0},{number: 2, position: 0}]});
                })
                const newGame = await General.findByIdAndUpdate({_id: id}, {active: true,activeGamer:firstgamer.id.toString()}, {new: true});
                
                return newGame
                
            } catch (error) {
                throw new Error(error)
            }
        },
        stopGame: async(_,{id}, ctx) => {
            try {
                const existGame = await General.findById(id);
                if(!existGame){
                    throw new Error('El juego no existe');

                }
                const newGame = await General.findByIdAndUpdate({_id: id}, {active:false}, {new: true});
                return newGame
            } catch (error) {
                throw new Error(error);
            }
        },
        updateNextGamer: async(_,{}, ctx) => {
            try {
                const existGame = await General.findOne({active: true});
                //const existGame = await General.findById(id);
                if(!existGame){
                    throw new Error('El juego no existe');

                }
                const activeGamer = existGame.activeGamer.toString();
                let tempindex = 0;
                existGame.gamers.forEach((item, index) => {
                    if(item.id.toString() === activeGamer){
                       
                        tempindex = index+1 == existGame.gamers.length ? 0 : index+1;
                    }
                });
                const newGeneral= await General.findByIdAndUpdate({_id: existGame._id}, {activeGamer: existGame.gamers[tempindex].id.toString()}, {new: true})
                return 'Siguiente jugador';
            } catch (error) {
                throw new Error(error);
            }
        },
        addActiveWinner: async(_,{id}, ctx) => {
            try {
                const existGamer = await Gamer.findById(id);

                if(!existGamer){
                    throw new Error('El jugador no existe');
                }

                const activeGeneralWinner = General.findOneAndUpdate({active:true},{winner: id},{new:true});
                return `${existGamer.name} ha ganado`;
            } catch (error) {
                throw new Error(error);
            }
        },
        
    }
}


module.exports = resolvers;