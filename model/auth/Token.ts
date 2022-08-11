class Token{
    private value = '';
    private type = '';

    get token(){
        return `${this.type} ${this.value}`;
    }

    setToken(obj){
        this.value = obj;
        this.type = obj;
    }
}

export default Token;