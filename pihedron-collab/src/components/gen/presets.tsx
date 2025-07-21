import Scene3D from "../../libs/Thrash/Scene";
import Box from "../../libs/Thrash/objects/Box";
import Camera from "../../libs/Thrash/Camera";
import Lights from "../../libs/Thrash/utils/Lights";
import Floor from "../../libs/Thrash/components/Floor";
import EnvMap from "../../libs/Thrash/utils/EnvMap";
import { Vector3 } from "three";

export const getScene = (camreaPos: Vector3 = new Vector3(2, 3, 2)) =>
  (
    <Scene3D background={"#050505"}>
      <Floor />
      <Camera localPosition={camreaPos} />
      <Lights />
      <EnvMap url="/textures/rogland_clear_night_2k.hdr" />
    </Scene3D>
  ) as Scene3D;
