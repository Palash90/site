export default function md5(s) {
  function d(n, b) {
    let r = "";
    for (let i = 0; i < 4; i++) r += "0123456789abcdef".charAt((n >> (i * 8 + 4)) & 15) + "0123456789abcdef".charAt((n >> (i * 8)) & 15);
    return r;
  }
  function F(x, y, z) { return (x & y) | (~x & z); }
  function G(x, y, z) { return (x & z) | (y & ~z); }
  function H(x, y, z) { return x ^ y ^ z; }
  function I(x, y, z) { return y ^ (x | ~z); }
  function rotate(x, n) { return (x << n) | (x >>> (32 - n)); }
  function FF(a, b, c, d, x, s, ac) { a = rotate((a + F(b, c, d) + x + ac) | 0, s) + b | 0; return a; }
  function GG(a, b, c, d, x, s, ac) { a = rotate((a + G(b, c, d) + x + ac) | 0, s) + b | 0; return a; }
  function HH(a, b, c, d, x, s, ac) { a = rotate((a + H(b, c, d) + x + ac) | 0, s) + b | 0; return a; }
  function II(a, b, c, d, x, s, ac) { a = rotate((a + I(b, c, d) + x + ac) | 0, s) + b | 0; return a; }
  let b = unescape(encodeURIComponent(s)).split("").map(c => c.charCodeAt(0));
  b.push(0x80);
  while (b.length % 64 !== 56) b.push(0);
  let len = (s.length * 8) >>> 0;
  b.push(len & 0xff, (len >> 8) & 0xff, (len >> 16) & 0xff, (len >> 24) & 0xff);
  b.push(0, 0, 0, 0);
  let A = 0x67452301, B = 0xefcdab89, C = 0x98badcfe, D = 0x10325476;
  for (let i = 0; i < b.length; i += 64) {
    let M = []; for (let j = 0; j < 16; j++) M[j] = b[i + j * 4] | (b[i + j * 4 + 1] << 8) | (b[i + j * 4 + 2] << 16) | (b[i + j * 4 + 3] << 24);
    let a = A, bb = B, c = C, d = D;
    a = FF(a, bb, c, d, M[0], 7, 0xd76aa478); d = FF(d, a, bb, c, M[1], 12, 0xe8c7b756); c = FF(c, d, a, bb, M[2], 17, 0x242070db); bb = FF(bb, c, d, a, M[3], 22, 0xc1bdceee);
    a = FF(a, bb, c, d, M[4], 7, 0xf57c0faf); d = FF(d, a, bb, c, M[5], 12, 0x4787c62a); c = FF(c, d, a, bb, M[6], 17, 0xa8304613); bb = FF(bb, c, d, a, M[7], 22, 0xfd469501);
    a = FF(a, bb, c, d, M[8], 7, 0x698098d8); d = FF(d, a, bb, c, M[9], 12, 0x8b44f7af); c = FF(c, d, a, bb, M[10], 17, 0xffff5bb1); bb = FF(bb, c, d, a, M[11], 22, 0x895cd7be);
    a = FF(a, bb, c, d, M[12], 7, 0x6b901122); d = FF(d, a, bb, c, M[13], 12, 0xfd987193); c = FF(c, d, a, bb, M[14], 17, 0xa679438e); bb = FF(bb, c, d, a, M[15], 22, 0x49b40821);
    a = GG(a, bb, c, d, M[1], 5, 0xf61e2562); d = GG(d, a, bb, c, M[6], 9, 0xc040b340); c = GG(c, d, a, bb, M[11], 14, 0x265e5a51); bb = GG(bb, c, d, a, M[0], 20, 0xe9b6c7aa);
    a = GG(a, bb, c, d, M[5], 5, 0xd62f105d); d = GG(d, a, bb, c, M[10], 9, 0x02441453); c = GG(c, d, a, bb, M[15], 14, 0xd8a1e681); bb = GG(bb, c, d, a, M[4], 20, 0xe7d3fbc8);
    a = GG(a, bb, c, d, M[9], 5, 0x21e1cde6); d = GG(d, a, bb, c, M[14], 9, 0xc33707d6); c = GG(c, d, a, bb, M[3], 14, 0xf4d50d87); bb = GG(bb, c, d, a, M[8], 20, 0x455a14ed);
    a = GG(a, bb, c, d, M[13], 5, 0xa9e3e905); d = GG(d, a, bb, c, M[2], 9, 0xfcefa3f8); c = GG(c, d, a, bb, M[7], 14, 0x676f02d9); bb = GG(bb, c, d, a, M[12], 20, 0x8d2a4c8a);
    a = HH(a, bb, c, d, M[5], 4, 0xfffa3942); d = HH(d, a, bb, c, M[8], 11, 0x8771f681); c = HH(c, d, a, bb, M[11], 16, 0x6d9d6122); bb = HH(bb, c, d, a, M[14], 23, 0xfde5380c);
    a = HH(a, bb, c, d, M[1], 4, 0xa4beea44); d = HH(d, a, bb, c, M[4], 11, 0x4bdecfa9); c = HH(c, d, a, bb, M[7], 16, 0xf6bb4b60); bb = HH(bb, c, d, a, M[10], 23, 0xbebfbc70);
    a = HH(a, bb, c, d, M[13], 4, 0x289b7ec6); d = HH(d, a, bb, c, M[0], 11, 0xeaa127fa); c = HH(c, d, a, bb, M[3], 16, 0xd4ef3085); bb = HH(bb, c, d, a, M[6], 23, 0x04881d05);
    a = HH(a, bb, c, d, M[9], 4, 0xd9d4d039); d = HH(d, a, bb, c, M[12], 11, 0xe6db99e5); c = HH(c, d, a, bb, M[15], 16, 0x1fa27cf8); bb = HH(bb, c, d, a, M[2], 23, 0xc4ac5665);
    a = II(a, bb, c, d, M[0], 6, 0xf4292244); d = II(d, a, bb, c, M[7], 10, 0x432aff97); c = II(c, d, a, bb, M[14], 15, 0xab9423a7); bb = II(bb, c, d, a, M[5], 21, 0xfc93a039);
    a = II(a, bb, c, d, M[12], 6, 0x655b59c3); d = II(d, a, bb, c, M[3], 10, 0x8f0ccc92); c = II(c, d, a, bb, M[10], 15, 0xffeff47d); bb = II(bb, c, d, a, M[1], 21, 0x85845dd1);
    a = II(a, bb, c, d, M[8], 6, 0x6fa87e4f); d = II(d, a, bb, c, M[15], 10, 0xfe2ce6e0); c = II(c, d, a, bb, M[6], 15, 0xa3014314); bb = II(bb, c, d, a, M[13], 21, 0x4e0811a1);
    a = II(a, bb, c, d, M[4], 6, 0xf7537e82); d = II(d, a, bb, c, M[11], 10, 0xbd3af235); c = II(c, d, a, bb, M[2], 15, 0x2ad7d2bb); bb = II(bb, c, d, a, M[9], 21, 0xeb86d391);
    A = (A + a) >>> 0; B = (B + bb) >>> 0; C = (C + c) >>> 0; D = (D + d) >>> 0;
  }
  return d(A) + d(B) + d(C) + d(D);
}
