export default function PageIntro(props) {
    return <>
        <h1 style={{ color: props.h1Color }}>{props.h1}</h1>
        <p style={{ color: props.pColor }}>{props.p}</p>
        <br />
    </>
}