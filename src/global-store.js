
import { createStore } from 'redux'

function stringState(state = "test", action) {
    switch (action.type) {
        case 'UPDATE':
            return action.text
        default:
            return state
    }
}

let TOKEN = createStore(stringState)

const dataStore = {
    token: null,
    azurePath: "https://skypulis1chinanorth2.blob.core.chinacloudapi.cn/public/tasks/"
};

export default dataStore