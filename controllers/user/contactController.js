


const contact = async(req,res)=>{
    try{
        return res.render('contact')
    }
    catch(error){
        console.error("error in loading contact page",error);
        res.status(500).send('server not found');
    }
}


module.exports={
    contact,
}