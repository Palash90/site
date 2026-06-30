import Markdown from "react-markdown"
import { Col, Container, Image, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import SocialRow from "./SocialRow";
import { fetchWithCache } from "../utils/cache";

const CODE_KEYWORDS = {
  javascript: ['async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'null', 'of', 'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'undefined', 'var', 'void', 'while', 'with', 'yield'],
  python: ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'],
  java: ['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'false', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try', 'void', 'volatile', 'while'],
  cpp: ['auto', 'bool', 'break', 'case', 'catch', 'char', 'class', 'const', 'constexpr', 'continue', 'default', 'delete', 'do', 'double', 'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept', 'nullptr', 'operator', 'override', 'private', 'protected', 'public', 'register', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'template', 'this', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'while'],
  typescript: ['abstract', 'any', 'as', 'asserts', 'async', 'await', 'boolean', 'break', 'case', 'catch', 'class', 'const', 'constructor', 'continue', 'debugger', 'declare', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function', 'get', 'if', 'implements', 'import', 'in', 'infer', 'instanceof', 'interface', 'is', 'keyof', 'let', 'module', 'namespace', 'never', 'new', 'null', 'number', 'of', 'package', 'private', 'protected', 'public', 'readonly', 'return', 'require', 'set', 'static', 'string', 'super', 'switch', 'symbol', 'this', 'throw', 'true', 'try', 'type', 'typeof', 'undefined', 'unique', 'unknown', 'var', 'void', 'while', 'with', 'yield'],
  rust: ['as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn', 'else', 'enum', 'extern', 'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self', 'Self', 'static', 'struct', 'super', 'trait', 'true', 'type', 'union', 'unsafe', 'use', 'where', 'while'],
  go: ['break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else', 'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import', 'interface', 'map', 'package', 'range', 'return', 'select', 'struct', 'switch', 'type', 'var'],
  bash: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function', 'return', 'exit', 'export', 'local', 'declare', 'echo', 'read', 'set', 'unset', 'trap', 'source'],
};

function getLanguage(className) {
  return (className || '').replace(/^language-/, '') || '';
}

function highlightCode(code, lang) {
  const lines = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').split('\n');
  const keywords = CODE_KEYWORDS[lang] || CODE_KEYWORDS.javascript;

  const keywordSet = new Set(keywords);

  const colored = lines.map((line) => {
    const tokens = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === ' ' || line[i] === '\t') {
        let ws = '';
        while (i < line.length && (line[i] === ' ' || line[i] === '\t')) { ws += line[i]; i++; }
        tokens.push(ws);
      } else if (line[i] === '/' && line[i + 1] === '/') {
        tokens.push(`<span style="color:#6a9955">${line.slice(i)}</span>`);
        break;
      } else if (line[i] === '/' && line[i + 1] === '*') {
        let end = line.indexOf('*/', i + 2);
        if (end === -1) {
          tokens.push(`<span style="color:#6a9955">${line.slice(i)}</span>`);
          break;
        } else {
          tokens.push(`<span style="color:#6a9955">${line.slice(i, end + 2)}</span>`);
          i = end + 2;
        }
      } else if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
        const quote = line[i];
        let end = i + 1;
        while (end < line.length && line[end] !== quote) {
          if (line[end] === '\\') end++;
          end++;
        }
        if (end >= line.length) end = line.length;
        tokens.push(`<span style="color:#ce9178">${line.slice(i, end + (line[end] === quote ? 1 : 0))}</span>`);
        i = end + (line[end] === quote ? 1 : 0);
      } else if (/[0-9]/.test(line[i]) && (i === 0 || /[\s(){}[\];,:+\-*/%]/.test(line[i - 1]))) {
        let num = '';
        while (i < line.length && /[0-9.]/.test(line[i])) { num += line[i]; i++; }
        tokens.push(`<span style="color:#4ec9b0">${num}</span>`);
      } else if (/[a-zA-Z_$]/.test(line[i])) {
        let word = '';
        while (i < line.length && /[a-zA-Z0-9_$]/.test(line[i])) { word += line[i]; i++; }
        if (keywordSet.has(word)) {
          tokens.push(`<span style="color:#569cd6">${word}</span>`);
        } else if (i < line.length && line[i] === '(') {
          tokens.push(`<span style="color:#dcdcaa">${word}</span>`);
        } else {
          tokens.push(word);
        }
      } else {
        const char = line[i];
        const colors = { '#': '#608b4e', '@': '#d7ba7d' };
        tokens.push(colors[char] ? `<span style="color:${colors[char]}">${char}</span>` : char);
        i++;
      }
    }
    return tokens.join('');
  });

  return colored.join('\n');
}

function CodeBlock({ className, children, inline }) {
  const lang = getLanguage(className);
  const code = String(children).replace(/\n$/, '');
  const hasNewline = code.includes('\n');
  const hasLang = className && /language-\w+/.test(className);

  const isInline = inline === true || (!hasNewline && !hasLang);

  if (isInline) {
    return <code style={{ background: '#3c3c3c', color: '#81ecec', padding: '2px 6px', borderRadius: '3px', fontSize: '0.9em' }}>{code}</code>;
  }

  const lines = code.split('\n');
  const highlighted = highlightCode(code, lang);

  return (
    <div style={{ position: 'relative', margin: '1.5em 0', borderRadius: '6px', overflow: 'hidden', background: '#1e1e1e', borderLeft: '4px solid #e3f988' }}>
      {lang && (
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 10px', fontSize: '11px', color: '#22d3ee', background: '#2d2d2d', borderBottomLeftRadius: '6px', textTransform: 'uppercase', letterSpacing: '1px', zIndex: 3, fontWeight: 600 }}>
          {lang}
        </div>
      )}
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', overflowX: 'auto', paddingTop: lang ? '28px' : 0 }}>
          <div style={{ flex: '0 0 auto', textAlign: 'right', color: '#858585', userSelect: 'none', fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace", fontSize: '13px', lineHeight: 1.5, padding: '12px 0', minWidth: '44px' }}>
            {lines.map((_, i) => (
              <div key={i} style={{ padding: '0 12px' }}>{i + 1}</div>
            ))}
          </div>
          <pre style={{ margin: 0, padding: '12px 16px', flex: 1, fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace", fontSize: '13px', lineHeight: 1.5, color: '#d4d4d4', whiteSpace: 'pre', tabSize: 2, border: 'none', background: 'transparent', boxShadow: 'none', borderRadius: 0 }} dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(transparent, #1e1e1e)', pointerEvents: 'none', zIndex: 2 }} />
    </div>
  );
}

function slugifyId(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function extractText(children) {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(extractText).join('');
    if (children?.props?.children) return extractText(children.props.children);
    return '';
}

let headingIdx = 0;

export default function Blog(props) {
    const [mdData, setMdData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
    var className;

    switch(props.contentType){
        case "swe": 
            className = window.findProp("pages.contents.techBlogClass")
            break;
        case "music":
            className = window.findProp("pages.contents.musicBlogClass")
            break;
        default:
            className = window.findProp("pages.contents.genericBlogClass")
            break;
    }

    const makeHeading = (Tag) => {
        const Comp = ({ children, ...rest }) => {
            const text = extractText(children);
            const id = slugifyId(text) || `h-${headingIdx++}`;
            return <Tag id={id} {...rest}>{children}</Tag>;
        };
        Comp.displayName = `Heading${Tag}`;
        return Comp;
    };

    const components = {
        h1: makeHeading('h1'),
        h2: makeHeading('h2'),
        h3: makeHeading('h3'),
        h4: makeHeading('h4'),
        h5: makeHeading('h5'),
        h6: makeHeading('h6'),
        img: (props) => {
            return (
              <span style={{ display: 'flex', justifyContent: 'center', margin: '1.5em 0' }}>
                <span style={{ display: 'inline-flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid #333', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', background: '#1e1e1e', padding: '8px' }}>
                  <Image fluid loading="lazy" src={props.src} alt={props.alt || ''} style={{ borderRadius: '4px', display: 'block' }} />
                </span>
              </span>
            );
        },
        pre: ({ children }) => <>{children}</>,
        code: (props) => <CodeBlock {...props} />,
    }

    useEffect(() => {
        headingIdx = 0;
        fetchWithCache(props.mdUrl)
            .then(data => {
                setMdData(data);
                setLoading(false);
                if (props.onMdLoaded) props.onMdLoaded(data);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, [props.mdUrl])

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return <Container className={className} fluid>
        <Row>
            {props.publishDate?<Col><b>{window.findProp("labels.publishedOn")}</b>{props.publishDate}</Col>:<></>}
            {props.lastUpdated?<Col><b>{window.findProp("labels.lastUpdated")}</b>{props.lastUpdated}</Col>:<></>}
        </Row>
        <br />
        <Row>
            <Col>
                <Markdown
                    remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                    components={components}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                >
                    {mdData}
                </Markdown>
            </Col>
        </Row>
    </Container>
}
