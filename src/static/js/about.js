class Man {
    name = 'zhangsan';

    add = () => {
        return () => {
            console.log(this);

            console.log(this.name);
        }
    }
}

const man = new Man();
man.add()();

var hello = {
    name: 'hello',

    add: function (name) {
        console.log(this.name);
    }
}

hello.add();
