'use client';
import { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import { useAtom } from "jotai";
import { address, isLogin } from "@/app/store/store";
import encryptCoordinates, { FreeLanAddress, FreeLandAbi } from "@/app/api/FreeLand";
import { useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers/react";
import { BrowserProvider, Contract } from "ethers";
import { min } from "three/examples/jsm/nodes/Nodes.js";

export default function GlobalMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePosition, setLastMousePosition] = useState<{ x: number; y: number } | null>(null);
    const [loginState, setLoginState] = useAtom(isLogin);
    const [wallet, setWallet] = useAtom(address);
    const account = useWeb3ModalAccount()
    const { walletProvider } = useWeb3ModalProvider()
    const [region, setRegion] = useState(50)
    async function getRegions() {
        if (!account.isConnected) throw Error('User disconnected')
        if(!walletProvider){
            return;
         }
        const ethersProvider = new BrowserProvider(walletProvider)
        const signer = await ethersProvider.getSigner()
        const FreeLanContract = new Contract(FreeLanAddress, FreeLandAbi, signer);
        const regions = await FreeLanContract.getRegion();
        console.log("----regions-----", regions)
        setRegion(Number.parseInt(regions))
    }
    async function mint(idx: number, color: string) {
        if (!account.isConnected) throw Error('User disconnected')

        if(!walletProvider){
            return;
        }
        const ethersProvider = new BrowserProvider(walletProvider)
        const signer = await ethersProvider.getSigner()
        const FreeLanContract = new Contract(FreeLanAddress, FreeLandAbi, signer);
        await FreeLanContract.colorCube(idx, color);
    }
    useEffect(() => {
        if (loginState) {
            getRegions();
        }
        // 创建场景
        const scene = new THREE.Scene();
        // 创建正交相机
        const aspect = window.innerWidth / window.innerHeight;
        const camera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 1000);
        camera.position.set(0, 0, 10); // 设置相机位置
        camera.lookAt(0, 0, 0); // 使相机看向原点
        // 创建渲染器
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight - 44);
        mapContainerRef.current?.appendChild(renderer.domElement);

        // 函数：创建一个平面网格
        function createGrid(size: number | undefined, divisions: number | undefined) {
            const gridHelper = new THREE.GridHelper(size, divisions, 0x0000ff, 0x808080);
            gridHelper.rotation.x = Math.PI / 2; // 旋转网格以适应2D视图
            return gridHelper;
        }

        // 函数：在每个网格单元中放置一个平面
        function createPlanes(size: number, divisions: number) {
            const planes: any[][] = new Array(divisions).fill(0).map(() => new Array(divisions).fill(0));
            const planeSize = size / divisions; // 每个平面的尺寸
            const halfSize = size / 2;

            const planeGeometry = new THREE.PlaneGeometry(planeSize * 0.95, planeSize * 0.95);
            for (let i = 0; i < divisions; i++) {
                for (let j = 0; j < divisions; j++) {
                    if (i > region || j < region) {
                        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xe3e3e3, side: THREE.DoubleSide });
                        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
                        plane.position.set(
                            -halfSize + planeSize * (i + 0.5),
                            -halfSize + planeSize * (j + 0.5),
                            0
                        );
                        planes[i][j] = plane;
                    } else {
                        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
                        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
                        plane.position.set(
                            -halfSize + planeSize * (i + 0.5),
                            -halfSize + planeSize * (j + 0.5),
                            0
                        );
                        planes[i][j] = plane;
                    }
                }
            }
            return planes;
        }

        // 初始化网格和平面
        let gridSize = Math.max(window.innerWidth, window.innerHeight);
        let divisions = 50;
        let gridHelper = createGrid(gridSize, divisions);
        scene.add(gridHelper);

        let planes = createPlanes(gridSize, divisions);
        planes.forEach(planes => planes.forEach(plane => scene.add(plane)));

        // 根据坐标设置指定格子的颜色
        function setGridColor(planes: string | any[], x: number, y: number, color: any) {
            const gridSize = Math.max(window.innerWidth, window.innerHeight);
            const planeSize = gridSize / divisions;
            const halfSize = gridSize / 2;

            const i = Math.floor((x + halfSize) / planeSize);
            const j = Math.floor((y + halfSize) / planeSize);

            const index = i + j * divisions;
            if (index >= 0 && index < planes.length) {
                planes[index].material.color.set(color);
            }
        }
        // 动画函数
        const animate = function () {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // 调整窗口大小的处理
        const handleResize = () => {
            const aspect = window.innerWidth / window.innerHeight;
            camera.left = -window.innerWidth / 2;
            camera.right = window.innerWidth / 2;
            camera.top = window.innerHeight / 2;
            camera.bottom = -window.innerHeight / 2;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);

            // 重新生成网格和平面
            scene.remove(gridHelper);
            planes.forEach(planes => planes.forEach(plane => scene.remove(plane)));

            gridSize = Math.max(window.innerWidth, window.innerHeight);
            gridHelper = createGrid(gridSize, divisions);
            scene.add(gridHelper);

            planes = createPlanes(gridSize, divisions);
            planes.forEach(planes => planes.forEach(plane => scene.add(plane)));
        };
        // window.addEventListener('resize', handleResize);
        // 将二维数组展平成一维数组
        const flatPlanes = planes.flat();

        // 创建射线投射器
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        // 处理点击事件
        let lastIntersected: THREE.Object3D<THREE.Object3DEventMap> | null = null;
        function onPointerMove(event: { clientX: number; clientY: number; }) {
            if (!loginState) return;
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -((event.clientY - 44) / (window.innerHeight - 44)) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(flatPlanes);
            if (intersects.length > 0) {
                const intersected = intersects[0].object;
                if (lastIntersected !== intersected) {
                    const flatIndex = flatPlanes.indexOf(intersected);
                    const rowIndex = Math.floor(flatIndex / divisions);
                    const colIndex = flatIndex % divisions;
                    if (rowIndex <= region && colIndex >= region) {
                        if(intersected instanceof THREE.Mesh){
                            // 把当前被点击的平面颜色设置为随机颜色
                            intersected.material.color.set(Math.random() * 0xffffff);
                            lastIntersected = intersected;
                            // mint(flatIndex, intersected.material.color.getHexString());
                        }
                       
                    }
                }
            }
        }
        window.addEventListener('click', onPointerMove, false);


        return () => {
            window.removeEventListener('resize', handleResize);
            // 监听点击事件
            window.removeEventListener('click', onPointerMove);
            // window.removeEventListener('wheel', handleScroll);
            // mapContainerRef.current?.removeEventListener('mousedown', handleMouseDown);
            // window.removeEventListener('mousemove', handleMouseMove);
            // window.removeEventListener('mouseup', handleMouseUp);
            mapContainerRef.current?.removeChild(renderer.domElement);
        };
    }, [isDragging, lastMousePosition, loginState, wallet, region]);

    return <div className={"global-map"} ref={mapContainerRef} />;
}