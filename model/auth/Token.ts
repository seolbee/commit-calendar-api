class Token{
    private value = '';
    private type = '';

    get token(){
        return `${this.value}`;
    }

    setToken(access_token, type){
        this.value = access_token;
        this.type = type;
    }
}

export default Token;