angular.module('brewApp').component('login',{
    templateUrl: 'app/login/login.template.html',
    controller: ['loginService', '$location',
            function LoginController(loginService, $location) {
                this.btnDisabled = false;
                this.logMsg = "";
                this.codeRequired = false;
                this.whantsToCreate = true;
                if(localStorage.getItem('nickname')) {
                    this.nickname = localStorage.getItem('nickname');
                }
                this.OnRoomCodeChanged = function()
                {
                    if(this.room.match('^[A-Z]{6}$'))
                    {
                        this.btnDisabled = false;
                        this.whantsToCreate = false;
                        this.logMsg = "";
                        
                    } else if(this.room.length > 0) {
                        this.btnDisabled = true;
                        this.codeRequired = true;
                        this.whantsToCreate = false;
                        this.logMsg = "Неверный формат кода";
                    } else {
                        this.btnDisabled = false;
                        this.codeRequired = false;
                        this.whantsToCreate = true;
                        this.logMsg = "";
                    }
                };
                this.OnLogin = function(nickname, room, loginForm) {
                    onResolve = (result) => {
                        let data = JSON.parse(result.data);
                        let roomCode = data.roomCode;
                        sessionStorage.setItem('nickname', this.nickname);
                        sessionStorage.setItem('code', roomCode);
                        localStorage.setItem('nickname', this.nickname);
                        $location.url(`/room/${roomCode}`);
                    };
                    onReject = (error) => {
                        console.log(error);
                        this.logMsg = JSON.parse(error.data).error;
                    };
                    if(loginForm.$valid) {
                        loginService(nickname, room).then((result)=>onResolve(result), (error)=>onReject(error));
                    } else {
                        console.log("Fields should not be empty");
                    }
            };
        }
    ]
});