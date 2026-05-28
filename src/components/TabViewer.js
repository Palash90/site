export default function TabViewer(props) {
    if (!props.tab) return <p>No tab available</p>;

    return <div>
        <h3>{props.tab.title}</h3>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{props.tab}</pre>
    </div>
}