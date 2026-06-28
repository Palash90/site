export default function PageIntro(props) {
    return <div className={window.findProp("pages.home.mainStyle") + " page-intro"}>
        <h2 style={{ color: props.h1Color }}>{props.h1}</h2>
        <p style={{ color: props.pColor }}>{props.p}</p>
    </div>
}