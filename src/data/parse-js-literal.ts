/**
 * Reads a JavaScript array/object literal (like `const BRANDS = [ ... ]` in the
 * website's brands-data.js) without running it as code. Supports what that
 * file uses: comments, 'single'/"double"/`back-tick` strings, unquoted keys,
 * numbers, true/false/null and trailing commas.
 */

export function extractConstLiteral(source: string, name: string): unknown {
  const match = new RegExp(`const\\s+${name}\\s*=\\s*`).exec(source);
  if (!match) throw new Error(`Couldn't find "const ${name}" in the brand list`);
  return new LiteralParser(source, match.index + match[0].length).parseValue();
}

class LiteralParser {
  constructor(
    private src: string,
    private pos: number,
  ) {}

  parseValue(): unknown {
    this.skipSpace();
    const ch = this.src[this.pos];
    if (ch === '[') return this.parseArray();
    if (ch === '{') return this.parseObject();
    if (ch === "'" || ch === '"' || ch === '`') return this.parseString();
    if (ch === '-' || (ch >= '0' && ch <= '9')) return this.parseNumber();
    const word = this.parseIdentifier();
    if (word === 'true') return true;
    if (word === 'false') return false;
    if (word === 'null' || word === 'undefined') return null;
    throw this.error(`Unexpected "${word}"`);
  }

  private parseArray(): unknown[] {
    const out: unknown[] = [];
    this.pos++; // [
    for (;;) {
      this.skipSpace();
      if (this.src[this.pos] === ']') {
        this.pos++;
        return out;
      }
      out.push(this.parseValue());
      this.skipSpace();
      if (this.src[this.pos] === ',') this.pos++;
      else if (this.src[this.pos] !== ']') throw this.error('Expected , or ]');
    }
  }

  private parseObject(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    this.pos++; // {
    for (;;) {
      this.skipSpace();
      if (this.src[this.pos] === '}') {
        this.pos++;
        return out;
      }
      const ch = this.src[this.pos];
      const key = ch === "'" || ch === '"' ? this.parseString() : this.parseIdentifier();
      this.skipSpace();
      if (this.src[this.pos] !== ':') throw this.error('Expected :');
      this.pos++;
      out[key] = this.parseValue();
      this.skipSpace();
      if (this.src[this.pos] === ',') this.pos++;
      else if (this.src[this.pos] !== '}') throw this.error('Expected , or }');
    }
  }

  private parseString(): string {
    const quote = this.src[this.pos++];
    let out = '';
    while (this.pos < this.src.length) {
      const ch = this.src[this.pos++];
      if (ch === quote) return out;
      if (ch === '\\') {
        const next = this.src[this.pos++];
        const escapes: Record<string, string> = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', '0': '\0' };
        if (next === 'u') {
          out += String.fromCharCode(parseInt(this.src.slice(this.pos, this.pos + 4), 16));
          this.pos += 4;
        } else if (next === '\n') {
          // line continuation
        } else {
          out += escapes[next] ?? next;
        }
      } else {
        out += ch;
      }
    }
    throw this.error('Unterminated string');
  }

  private parseNumber(): number {
    const match = /^-?\d+(\.\d+)?([eE][+-]?\d+)?/.exec(this.src.slice(this.pos));
    if (!match) throw this.error('Bad number');
    this.pos += match[0].length;
    return Number(match[0]);
  }

  private parseIdentifier(): string {
    const match = /^[A-Za-z_$][\w$]*/.exec(this.src.slice(this.pos, this.pos + 64));
    if (!match) throw this.error('Unexpected character');
    this.pos += match[0].length;
    return match[0];
  }

  private skipSpace() {
    for (;;) {
      const ch = this.src[this.pos];
      if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
        this.pos++;
      } else if (ch === '/' && this.src[this.pos + 1] === '/') {
        const end = this.src.indexOf('\n', this.pos);
        this.pos = end === -1 ? this.src.length : end;
      } else if (ch === '/' && this.src[this.pos + 1] === '*') {
        const end = this.src.indexOf('*/', this.pos + 2);
        this.pos = end === -1 ? this.src.length : end + 2;
      } else {
        return;
      }
    }
  }

  private error(message: string) {
    return new Error(`${message} at character ${this.pos} of the brand list`);
  }
}
