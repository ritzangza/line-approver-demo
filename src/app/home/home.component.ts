import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import liff from '@line/liff';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userProfile: any;
  isLoggedIn: any;
  qString: string;
  queryString: any;

  constructor(
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      console.log("params", params);
      this.queryString = params;
      this.qString = params['q']
    });
  }

  ngOnInit(): void {
    console.log("queryParams", this.route.queryParams);
    liff.init({
      liffId: '1656926061-0APpnkPM', // Use own liffId
    }).then(() => {
      console.log("liff");
      if (liff.isLoggedIn()) {
        console.log('isLoggedIn');
        this.isLoggedIn = "1";
        liff.getProfile().then(profile => {
          console.log('profile', profile);
          this.userProfile = profile
        }).catch(err => console.error(err));
      } else {
        liff.login();
      }
    })
    .catch((err) => {
        console.log(err);
    });
  }

}
