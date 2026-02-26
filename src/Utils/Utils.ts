// WHY NOT 😉
export const CONSOLE_LOG =(signature:string, content:any='')=>{
    console.log(`
        ############################################ \n
        @${new Date().toString()} \n
        ${signature}\n
        ${content}
        ############################################ \n
        `);
}