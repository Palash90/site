import { FormLabel } from "react-bootstrap";
import getMessageText from "./messages";

export default function I18nLabel({ msg }) {
    return <FormLabel>{getMessageText(msg)}</FormLabel>
}