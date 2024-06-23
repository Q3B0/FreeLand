"use client";
import Image from "next/image";
import LandUnit from "@/app/components/LandUnit";
import dynamic from "next/dynamic";
import Head from "next/head";
import {NextUIProvider} from "@nextui-org/system";
import {Button, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem} from "@nextui-org/react";
import LoginInfo from "@/app/components/LoginInfo";
import ConnectButton from "@/app/components/ConnectButton";
import {atom} from "jotai/vanilla/atom";
import {isLogin} from "@/app/store/store";

const GlobalMap = dynamic(() => import('./components/GlobalMap'), {ssr: false});

export default function Home() {
    const handleScrollPosotion = (position: number) => {
        console.log("pos", position)
    }
    return (<div>
            <Head>
                <title>FreeLand</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main style={{width: '100%', height: '100vh'}}>
                <Navbar onScrollPositionChange={handleScrollPosotion}>
                    <NavbarBrand>
                        <p className="font-bold text-inherit">FREE LAND</p>
                    </NavbarBrand>
                    <NavbarContent justify="end">
                        <NavbarItem>
                            <ConnectButton/>
                        </NavbarItem>
                    </NavbarContent>
                </Navbar>
                <GlobalMap/>
            </main>
        </div>);
}
