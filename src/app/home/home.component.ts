import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import liff from '@line/liff';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  title: String;
  userProfile: any;
  jogetProfile: any;
  isLoggedIn: any;
  qString: string;
  _queryString: any;
  form: FormGroup;
  _activityId: string;
  _processId: string;
  _recordId: string;
  responseVal: string;
  statusMsg: string;

  private _api_id = "API-52f4b8f3-e97e-4168-a3f6-4b87e641609d";
  private _api_key = "cbe652c4e938423193b7bb8ec580998a";
  config = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept': 'application/json',
      'api_id': this._api_id,
      'api_key': this._api_key,
    }
  }

  constructor(
    private route: ActivatedRoute,
    public fb: FormBuilder
  ) {
    this.title = "Form 1 Approval";
    this.route.queryParams.subscribe((params) => {
      console.log("params", params);
      this._queryString = params;
      this.qString = params['q']
      this._activityId = params['activityId']
      this._processId = params['processId']
      this._recordId = params['recordId']
    });

    this.form = fb.group({
      approval_status: this.fb.control(''),
      _approval: this.fb.control('Approved', [Validators.required]),
      remarks: this.fb.control('')
    });
  }

  ngOnInit(): void {
    console.log("queryParams", this.route.queryParams);
    liff.init({
      liffId: environment.liffId, // Use own liffId
    }).then(() => {
      console.log("liff");
      if (liff.isLoggedIn()) {
        console.log('isLoggedIn');
        this.isLoggedIn = "1";
        liff.getProfile().then(profile => {
          console.log('profile', profile);
          this.userProfile = profile
          this.getUserDetail();
        }).catch(err => console.error(err));
      } else {
        liff.login({ redirectUri: environment.lineUrl + "/home?activityId=" + this._activityId + "&processId=" + this._processId + "&recordId=" + this._recordId + "" });
      }
    })
    .catch((err) => {
        console.log(err);
    });
  }

  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  submitForm() {
    console.log("value", this.form.value);
    console.log("_approval", this.form.get("_approval").value);
    this.saveMainForm();
  }

  saveMainForm() {
    let url = environment.endPoint + "/form/frm1_approval";
    var data = {
      "id": this._recordId,
      "approval_status": this.form.get("_approval").value,
      "approval": {
        "parent_id": this._recordId,
        "status": this.form.get("_approval").value,
        "remarks": this.form.get("remarks").value,
        "approver": this.userProfile.displayName,
        // "approval_date": "string"
      },
      "trails": [{
        "status": this.form.get("_approval").value,
        "remarks": this.form.get("remarks").value,
        "approver": this.userProfile.displayName,
        // "approval_date": "string"
      }]
    }
    console.log("saveMainForm : url", url, data);
    axios.put(url, data, this.config)
    .then(res => {
      console.log("res.status", res.status);
      if(res.status === 200){
        // this.responseVal = res.data;
        console.log("saveMainForm", res.data);
        // Swal.fire({
        //   icon: 'success',
        //   title: 'SUCCESS',
        //   showConfirmButton: false,
        // })
        this.saveLogsForm()
      }else{
        Swal.fire({
          icon: 'error',
          title: res.data.message,
          showConfirmButton: false,
        })
      }
    })
    .catch(function (error) {
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Sorry, Something Went Wrong',
          showConfirmButton: false,
        })
        this.statusMsg = error;
    });
  }

  saveActionForm() {

  }

  saveLogsForm() {
    let url = environment.endPoint + "/form/frmLogs";
    var data = {
      "processId": this._processId,
      "activityId": this._activityId,
      "recordId": this._recordId,
      "assignmentUser": "string",
      "messages": "string",
      "line_user_id": this.userProfile.userId,
    }
    console.log("saveLogsForm : url", url, data);
    axios.post(url, data, this.config)
    .then(res => {
      console.log("res.status", res.status);
      if(res.status === 200){
        // this.responseVal = res.data;
        console.log("saveLogsForm", res.data);
        // Swal.fire({
        //   icon: 'success',
        //   title: 'SUCCESS',
        //   showConfirmButton: false,
        // })
        this.completeActivities()
      }else{
        Swal.fire({
          icon: 'error',
          title: res.data.message,
          showConfirmButton: false,
        })
      }
    })
    .catch(function (error) {
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Sorry, Something Went Wrong',
          showConfirmButton: false,
        })
        this.statusMsg = error;
    });
  }

  completeActivities(){
    let url = environment.endPoint + '/assignment/completeByUser/admin/'+ this._activityId;
    var dataParams = "?status=" + this.form.get("_approval").value;
    console.log("completeActivities : url", url, dataParams);
    axios.post(url + dataParams, null, this.config)
    .then(res => {
      console.log("res.status", res.status);
      if(res.status === 200){
        // this.responseVal = res.data;
        console.log("completeActivities", res.data);
        Swal.fire({
          icon: 'success',
          title: 'SUCCESS',
          showConfirmButton: false,
        })
      }else{
        Swal.fire({
          icon: 'error',
          title: res.data.message,
          showConfirmButton: false,
        })
      }
    })
    .catch(function (error) {
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Sorry, Something Went Wrong',
          showConfirmButton: false,
        })
        this.statusMsg = error;
    });
  }

  getUserDetail() {
    let url = environment.endPoint + '/list/listUser';
    var dataParams = "?c_line_user_id=" + this.userProfile.userId;
    console.log("getUserDetail : url", url, dataParams);
    axios.get(url + dataParams, this.config)
    .then(res => {
      console.log("res.status", res.status);
      if(res.status === 200){
        this.jogetProfile = res.data;
        console.log("getUserDetail", res.data);
        console.log("typeof  getUserDetail", typeof res.data);
        console.log("getUserDetail", res.data[0].id);

      }else{
        Swal.fire({
          icon: 'error',
          title: res.data.message,
          showConfirmButton: false,
        })
      }
    })
    .catch(function (error) {
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Sorry, Something Went Wrong',
          showConfirmButton: false,
        })
        this.statusMsg = error;
    });
  }
}
