// libs
import fs from 'fs'
import path from 'path'
import request from 'request'
import http from 'http'
import mkdirp from 'mkdirp'
import URL from 'url-parse'

// src
import conf from '../configuration'
import logger from './logger'

export { default as logger } from './logger'

// request.debug = true
const KEY_PAGE = 'page'
const KEY_PER_PAGE = 'per_page'
const KEY_REPORT = 'report'

let requestCount = 0

export const getRequestCount = () => requestCount

export const length = items => items ? items.length : 0

export const track = async (name, fn, ...args) => {
    const line = logger.append(`Downloading ${name} ...`)
    const items = await fn(...args)
    line.update(`${name}: ${length(items)}`)

    return items
}

export const ensureDirectory = path =>
    new Promise((resolve, reject) => {
        // logger.append(`[ensureDirectory] ${path}`)

        mkdirp(path, err => {
            if ( err ) reject(err)
            
            resolve(path)
        })
    })

export const readFile = fileName =>
    new Promise((resolve, reject) => {
        fs.readFile(path.resolve(fileName), 'utf8', (err, data) => {
            if (err) reject(err)
            resolve(data)        
        })
    })

export const readJSONFile = async filename => {
    const body = await readFile(filename)
    return JSON.parse(body)
}

export const writeFile = (fileName, data) =>
    new Promise((resolve, reject) => {
      fs.writeFile(path.resolve(fileName), data, 'utf8', (err) => {
          if (err) reject(err)
          else resolve(data)
      })
    })

export const writeJSONFile = (filename, data) => writeFile(filename, JSON.stringify(data))

export const hasFile = filename =>
    new Promise((resolve, reject) => {

        // courtesy: https://stackoverflow.com/a/36594690/162461
        fs.readFile(filename, 'utf8', function(err,data){
            // the err variable substitutes for the fs.exists callback function variable
            if (err) {
                // do what you planned with the file
                // console.log(data)
                resolve(false)
            }

            resolve(true)
        });
    })

// courtesy: https://stackoverflow.com/a/3710226/162461
export const isJSON = str => {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}

const promiseRequest = options =>
    new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if ( error ) {
                reject(error, response, body)
                return
            }

            resolve(response)
        })
    })

const secureRequest = async (uri, pOptions = {}) => {
    // const line = logger.append(`[GET] ${uri} -- Requesting ...`)
    requestCount++
    let response
    const options = {
        uri,
        headers: {
            'X-Api-Key': conf.key,
            'X-Api-Secret': conf.secret
        },
        timeout: 20000,
        ...pOptions
    }

    try {
        response = await promiseRequest(options)
    } finally {
        // const { statusCode } = response
        // line.update(`[GET] ${uri} -- ${statusCode}`)
    }

    
    // console.log(`[GET] uri: ${uri}, statusCode: ${statusCode}`)

    if ( response ) {
        const { statusCode } = response
        if ( statusCode === 429 ) throw new Error(`API limit exceeded!`)
    }

    return response
}

// https://stackoverflow.com/a/22907134/162461
export const download = async (uri, filename) =>
    new Promise((resolve, reject) => {
        requestCount++
        const writable = fs.createWriteStream(filename)
        
        request({
            uri,
            headers: {
                'X-Api-Key': conf.key,
                'X-Api-Secret': conf.secret
            }
        })
        .pipe(writable)
        .on('error', function(err) { // Handle errors
            fs.unlink(filename); // Delete the file async. (But we don't check the result)
            reject(err.message)
        })
        .on('close', function() {
            writable.end()
            resolve(filename)
        })
    })

const __getReq__ = async (pURI, qs) => {
    const uri = `${conf.host}${pURI}.json`
    // logger.append(`[__getReq__] GET ${uri}`)
    const response = await secureRequest(uri, {
        json: true,
        qs
    })
    return response
}

export const getReq = async (uri, qs) => {
    const response = await __getReq__(uri, qs)
    return response.body
}
// export const getReqP = getReq

const __getReqP__ = async (
        uri,
        externalOptions = {}
    ) => {
    
    const options = {
        [KEY_PAGE]: 0,
        [KEY_PER_PAGE]: 10,
        ...externalOptions
    }

    let output = []

    // dupchecks
    // const map = {}

    // let response
    let page = options[KEY_PAGE]
    let statusCode = 200
    let body

    do {
        const response = await __getReq__(uri, { ...options, [KEY_PAGE]: page })
        statusCode = response.statusCode
        body = response.body
        
        if ( body ) {
            output = output.concat(body)
        }

        page++
    } while ( statusCode === 200 )

    return { body: output }
}

export const getReqP = async (uri, externalOptions) => {
    const response = await __getReqP__(uri, externalOptions)
    return response.body
}

export async function *getReqGP(uri, externalOptions = {}) {
    // const line = logger.append(`[getReqGP] GET ${uri}`)

    const options = {
        [KEY_PAGE]: 1,
        [KEY_PER_PAGE]: 10,
        ...externalOptions
    }

    // dupchecks
    // const map = {}

    // let response
    let page = options[KEY_PAGE]
    let statusCode = 200

    do {
        const response = await __getReq__(uri, { ...options, [KEY_PAGE]: page })
        statusCode = response.statusCode
        const { body: items } = response

        // line.update(`[getReqGP] GET ${uri} -- ${statusCode} -- page: ${page} -- items: ${items && items.length}`)
        
        if ( items ) {
            yield { items, page }
        }

        page++
    } while ( statusCode === 200 )
}
