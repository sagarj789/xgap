import { Component, OnInit, Injector } from '@angular/core';
import { BaseComponent } from '../../../common/commonComponent'

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent extends BaseComponent implements OnInit {

  constructor(inj:Injector) {
  	super(inj); 
  	this.activatedRoute.params.subscribe( params => {
      if(params['id'] == 'new'){
        this.isNew = true;
        this.user = {}
      }else{
        this.isNew = false;
        this.getUserProfile(params['id'])
      }
  	})
  }

  public isNew : boolean;
  public submitted : boolean = false;
  public user:any = {}
  public roleList = [{"id":"Manager", "name":"Manager"},{"id":"Employee",  "name":"Employee"}];
  public secondary_role = "Manager";

  ngOnInit() {
  }

  public showLoader:boolean = false;


  submitForm(form){
    if(form.valid){
       this.showLoader = true;
       if(this.isNew){
           this.commonService.callApi('register', form.value, 'post').then(success=>{
             this.showLoader = false;
             if(success.status == 1){
              this.popToast('success',success.message)
              this.router.navigate(["/main/users/user-list"]);
            }else{
              this.popToast('error',success.message)
            }
           })
       }else{
           var user = {
                uid:this.user._id,
                firstname: this.user.firstname,
                lastname:this.user.lastname,
                mobile:this.user.mobile,
                //username:this.user.username,
                company_name:this.user.company_name,
                address:this.user.address,
                secondary_role:this.user.secondary_role,
                //photo:3445.jpg // not required if update then only send
            }

            
            user['photo'] = this.user.photo;
            
             this.commonService.callApi('editUserListing', user, 'post').then(success=>{
               this.showLoader = false;
               if(success.status == 1){
                this.popToast('success',success.message)
                this.getUserProfile(user.uid)
              }else{
                this.popToast('error',success.message)
              }
             })
       }
       
    }
  }

  //public baseUrl = this.commonService._apiUrl;

  public profile_photo:any;
  public imageData:any;
  previewImage(event) {
       // Reference to the DOM input element
       var input = event.target;
       // Ensure that you have a file before attempting to read it
        if (input.files && input.files[0]) {
           // create a new FileReader to read this image and convert to base64 format
              var reader = new FileReader();
          // Define a callback function to run, when FileReader finishes its job
              reader.onload = (e:any) => {
          // Note: arrow function used here, so that "this.imageData" refers to the imageData of Vue component
          // Read image as base64 and set to imageData
                  this.imageData = e.target.result;
                  this.profile_photo = input.files[0];
                  var fd = new FormData();
                  fd.append('photo',this.profile_photo)
                  this.commonService.callApi('uploadPhoto', fd, 'post', true).then(success=>{
                    if(success.status == 1){
                       this.user.photo = success.path;
                       //this.popToast('success',success.message)
                    }else{
                        this.popToast('error',success.message)
                    }
                  })
              }
       // Start the reader job - read file as a data url (base64 format)
              reader.readAsDataURL(input.files[0]);
      }
  }


  /****************************************************************************
  @PURPOSE      : Get user's profile
  /****************************************************************************/
  getUserProfile(id){
    let data = { uid : id}
    this.commonService.callApi('userProfile', data, 'post').then(success=>{
      if(success.status == 1){
        this.user = success.data
        this.user.email = success.data.emailId;
        this.secondary_role = success.data.secondary_role;
      }else{
        this.popToast('error',success.message)
      }
    })
  }
  /****************************************************************************/

  rangeChanged(e){
    console.log(e)
  }

}
