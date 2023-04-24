const {gql} = require('apollo-server');

const typeDefs = gql`

    type Piece {
        number: Int
        position: Int
    }

    type Gamer {
        id: ID
        name: String
        hits: Int
        pieces: [Piece]
    }

    input GamerInput {
        name: String!
    }

    type Answer {
        number: String
        text: String
    }

    type Question {
        id: ID
        question: String
        answers: [Answer]
        correctAnswer: String
    }

    type ReturnQuestion {
        id:ID
        question: String
        answers: [Answer]
    }

    type General {
        id: ID
        active: Boolean
        gamers: [Gamer]
        name: String
        activeGamer: Gamer
        winner: Gamer
    }

    input GeneralInput {
        name: String!
    }

    input ReturnAnswerInput {
        question: ID!
        answer: String
    }

    input QuestionInput{
        question: String!
        answers: [AnswerInput]
        correctAnswer: String!
    }

    input AnswerInput {
        number: String!
        text: String!
    }

    input positionInput{
        number: Int
        position: Int
    }

    input UpdatepositionInput {
        number: Int
        position: Int
    }

    input AddGamerInput {
        gamer: ID!
        game: ID!
    }

    type Token {
        token: String
        id: ID
    }


    type Query {
        getGamers: [Gamer]
        getGamer(id: ID!): Gamer

        getQuestions: [Question]
        getQuestion(id: ID) : Question
        getRandomQuestion: ReturnQuestion
        verifyQuestion(input: ReturnAnswerInput): Boolean

        getGenerals: [General]
        getGeneral(id:ID!): General
        getActiveGeneral: General

        getActiveGeneralGamers: [Gamer]
    }


    type Mutation {
        newGamer(input: GamerInput): Token
        updateGamer(id: ID!, input: GamerInput): Gamer
        deleteGamer(id: ID!): String

        updatePosition(id: ID!, input: positionInput): String
        updateMyPosition( input: UpdatepositionInput): String

        newQuestion(input: QuestionInput): Question
        updateQuestion(id: ID!, input: QuestionInput): Question
        deleteQuestion(id:ID!): String

        newGeneral(input: GeneralInput): General
        deleteGeneral(id: ID!): String
        addGamer(input: AddGamerInput): General
        startGame(id: ID!): General
        stopGame(id: ID!): General
        updateNextGamer: String

        addActiveWinner(id:ID!): String
    }
`;



module.exports = typeDefs;