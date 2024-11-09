import { useParams } from "react-router-dom";
import Home from "./Home";

export default function CustomComponent() {
    const componentMap = {
        hdlEmulator: <Home />
    }
    let params = useParams()
    console.log(componentMap, params.componentId, componentMap[params.componentId])
    return componentMap[params.componentId]
}