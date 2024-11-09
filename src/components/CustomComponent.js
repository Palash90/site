import { useParams } from "react-router-dom";

export default function CustomComponent() {
    var component = useParams().componentId;
    return <div>Component {component}</div>
}