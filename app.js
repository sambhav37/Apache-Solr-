var bodyParser      = require("body-parser"),
    methodOverride  = require("method-override"),
    expressSanitizer= require("express-sanitizer"),
    format          = require("string-format"),
    SolrNode        = require("solr-node"),
    express         = require("express"),
    fileUpload      = require('express-fileupload'),
    csvjson         = require('csvjson'),
    readFile        = require('fs').readFile;
    app             = express();

app.use(fileUpload());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.set("view engine","ejs");

// Set logger level (can be set to DEBUG, INFO, WARN, ERROR, FATAL or OFF)
//require('log4js').configure("app.log").getLogger('solr-node').level = 'DEBUG';

var log4js = require('log4js');
log4js.configure(
    {
        appenders:{'file':{type:'file',filename:'logs\\debug.log'}},
        categories:{
            default:{
                appenders:['file'],
                level:'DEBUG'
            }
    }
});
var logger = log4js.getLogger('solr-node');


// Create client
var client = new SolrNode({
    host: '127.0.0.1',
    port: '8983',
    core: 'RAIL',
    protocol: 'http'
});


//RESTFUL ROUTES

app.get("/",function(req,res){
    res.render("new1");
});

//   SEARCH ROUTE
app.post("/blogs",function(req,res){
    var data = req.body.blog.fl.split(",");
    if (data[0] == ""){
        data = [provide all the column names];
    }

    var query = req.body.blog.q;
    if(query == ""){
        query = "*:*"
    }else{
        if(query.includes(":")){
            query = req.body.blog.q;
        }else{
            if(query.includes(",")){
                query = query.replace(","," ")
            }else{
                if(query.includes("AND")||query.includes("OR")||query.includes("+")||query.includes("!")||query.includes("-")){
                    query = req.body.blog.q;
                }else{
                    var temp = "\"$a\""
                    query = temp.replace("$a",query)
                }
            }
        }
    }

    var wt = req.body.blog.wt;
    if(wt == ""){
        wt = "json"
    }

    var strQuery = client.query()
    .q(query)
    //.q('directed_by:"Gary"')
    .fl(req.body.blog.fl)
    //.fl("genre,initial_release_date");
    .wt(wt)

    var fq = req.body.blog.fq_field;
    if(fq!=""){
        var temp1 = "[$a]"
        var value1 = temp1.replace("$a",req.body.blog.fq_value);
        //value1 = value1.replace("\\","").replace("\\","");
        // console.log(value1)
        // console.log("[\"Shane Acker\" TO *]")
        strQuery = strQuery.fq({
            field: req.body.blog.fq_field,
            //value: "[\"Shane Acker\" TO *]"
            value: value1
        })
        //console.log(strQuery)
    }

    var df = req.body.blog.df;
    if(df!=""){
        strQuery = strQuery.df(df)
    }
    
    var facet_flag=0;
    if(req.body.blog.f_query !=""||req.body.blog.f_field !=""){
        facet_flag = 1;
        strQuery = strQuery.facetQuery({
            query: req.body.blog.f_query,
            field: req.body.blog.f_field
        })
    }

    var rows = req.body.blog.rows;
    if(rows == ""){
        rows = 10;
    }

    var start = req.body.blog.start;
    if(start == ""){
        start = 0;
    }

    strQuery = strQuery.start(start).rows(rows);

    client.search(strQuery,function(err,result){
        if(err){
            console.log(err);
            res.render("new1");
        }else{
            if(result.response.numFound==0){
                res.render("no_results");
            }else{
                //console.log('Response:', result);
                if(facet_flag==0){
                    res.render("index2",{
                        blogs:result.response.docs,
                        blogs1:data,
                        entries:result.response.numFound,
                        time:result.responseHeader.QTime});
                }else{
                    res.render("index1",{
                        blogs:result.response.docs,
                        blogs1:data,
                        entries:result.response.numFound,
                        time:result.responseHeader.QTime,
                        facet:result.facet_counts,
                        query:req.body.blog.f_query,
                        field:req.body.blog.f_field
                    });
                }
                }
            }
    });
});


// UPDATE ROUTE
app.get('/upload',function(req,res){
    res.render("upload");
});


app.post('/upload', function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).render("no_file_uploaded");
    }else{
        let sampleFile = req.files.sampleFile;
        sampleFile.mv('yes.csv',function(err){
            if(err){
                return res.status(500).render("no_file_uploaded");
            }else{
                readFile('yes.csv','utf-8',(err, fileContent)=>{
                    if(err){
                        console.log(err);
                        res.render("no_file_uploaded");
                    }else{
                        const jsonObj = csvjson.toObject(fileContent);
                        jsonObj.forEach(e=>{
                            // console.log("First one");
                            // console.log(e);
                            client.update(e,function(err,result){
                                if(err){
                                    console.log(err)
                                    res.render("no_file_uploaded");
                                }else{
                                    console.log('Response:', result.responseHeader);
                                }
                            });
                        });
                        res.render("upload_complete")
                    }
                });
            }
        });
    }  
  });

app.listen(6003,function(){
    console.log("Solr Server has Started at Port 6003");
});

//***************This method helps to define port to node-server by default **********/
// app.listen(process.env.PORT,process.env.IP,function(){
//     console.log("server started");
// });