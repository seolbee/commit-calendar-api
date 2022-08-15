class API{
    private baseURL = '';
    private authURL = '';
    private method = '';
    private headers:Object;
    private form:Object;
    private client_id = '';
    private client_secret = '';

    constructor(baseURL:string, authURL:string){
        this.baseURL = baseURL;
        this.authURL = authURL;
    }

    
}