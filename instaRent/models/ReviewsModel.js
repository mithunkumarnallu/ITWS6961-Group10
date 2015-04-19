var mongoose = require('./mongoose_connector').mongoose;
var Schema = mongoose.Schema;
var ReviewSchema = new Schema({
 name: String,
 comment: String,
 createdAt:      {type: Date, required: true, default: Date.now},  
 status_flag:    {type: Boolean, required: true, default: false}  
});

var ReviewModel = mongoose.model('ReviewModel', ReviewSchema);

exports.ExtractReviews=function(done){

ReviewModel.find({}).lean().sort({createdAt: -1}).limit(4).exec(function(err,reviews){   // lean() converts read documents into JSON object
		var ReviewMap={};
		reviews.forEach(function(review){

			ReviewMap[review._id]=review;
			console.log("read: "+ReviewMap[review._id].comment);
		});
      done(ReviewMap);

    });
}

exports.SaveReview=function(name,comment,done){

    var newReview=new ReviewModel({
        name: name,
        comment: comment
    });
    
   newReview.save(function(err,rev,numberAffected){
   
   if(numberAffected==1)
   {
       console.log("review written to DB");
       done(null);
   }
    else
    {
        console.log("review numAffected !=0");
        done(numberAffected);
    }
                   
   });
}

exports.ReviewModel=ReviewModel;

