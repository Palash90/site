export default function PageIntro(props) {
    return <div className={window.findProp("pages.home.mainStyle")}>
        <h1 style={{ color: props.h1Color }}>{props.h1}</h1>
        <p style={{ color: props.pColor }}>{props.p}</p>
        <br />
    </div>
}