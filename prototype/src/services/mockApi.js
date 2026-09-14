import {mockAdapters,mockEvents,mockSummary} from '../mock/data.js'
const clone=value=>JSON.parse(JSON.stringify(value))
const wait=(value,delay=180)=>new Promise(resolve=>window.setTimeout(()=>resolve(clone(value)),delay))
export const mockApi=Object.freeze({getDashboard:()=>wait({summary:mockSummary,events:mockEvents,adapters:mockAdapters}),getAdapters:()=>wait(mockAdapters)})