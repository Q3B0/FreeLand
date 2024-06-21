import {Button, Link} from "@nextui-org/react";

export default function LoginInfo({isLogin}){
    if(isLogin){
        return (
            <p>0x00001</p>
        )
    }else{
        return ( <Button className={"m-[2px]"} as={Link} color="primary" href="#" variant="flat">
            Connect Wallet
        </Button>)
    }
}