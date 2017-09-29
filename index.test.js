const reqVal = timeout => {
    console.log(`[reqVal] invoked with timeout ${timeout}`)
    return new Promise(resolve => {
        // conosle.log(`Setting timeout with i=${i}`)
        setTimeout(() => {
            resolve(timeout)
        }, timeout)
    })
}
async function *download() {
    // reqVal(1).then(v => console.log(v))

    yield 1 // reqVal(1000)
    yield 2 // reqVal(2000)
}

;(async () => {
    const it = download()
    
    console.log(await it.next())
    console.log(await it.next())
    
    
})()