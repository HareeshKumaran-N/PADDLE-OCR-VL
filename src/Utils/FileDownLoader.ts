import axios from "axios";

const fileDownloader = async (url:string)=> {
    const res = await axios.get(url,{responseType:'arraybuffer'});
    
};
