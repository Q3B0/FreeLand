import {useWalletInfo, useWeb3Modal} from '@web3modal/ethers/react'
import {Button, Link} from "@nextui-org/react";
import {address, isLogin} from "@/app/store/store";
import {useAtom} from "jotai";
import {useEffect} from "react";

export default function ConnectButton() {
    // 4. Use modal hook
    const { open } = useWeb3Modal()
    const { walletInfo } = useWalletInfo()
    const [loginState, setLoginState] = useAtom(isLogin);
    const [wallet, setWallet] = useAtom(address);
    useEffect(()=> {
        if(walletInfo && walletInfo.name){
            setLoginState(true);
            setWallet(walletInfo.name);
        }else{
            setLoginState(false);
            setWallet("");
        }
    }, [setWallet]);

    if(loginState){
        return (
            <Button onClick={()=> open()} className={"m-[2px]"} as={Link} color="success" href="#" variant="flat">
                {wallet}
            </Button>
        )
    }else{
        return (
            <Button onClick={()=> open()} className={"m-[2px]"} as={Link} color="primary" href="#" variant="flat">
                Connect Wallet
            </Button>
        )
    }
}