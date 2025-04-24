// This file is used to set up the test environment
import { vi } from 'vitest';

// Mock fetch if it doesn't exist
if (typeof global.fetch === 'undefined') {
  global.fetch = vi.fn().mockImplementation(() => 
    Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  );
}

// Mock Headers if it doesn't exist
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this.headers = {};
      if (init) {
        if (init instanceof Headers) {
          Object.assign(this.headers, init.headers);
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => {
            this.headers[key.toLowerCase()] = value;
          });
        } else {
          Object.keys(init).forEach(key => {
            this.headers[key.toLowerCase()] = init[key];
          });
        }
      }
    }
    
    append(key, value) {
      this.headers[key.toLowerCase()] = value;
    }
    
    get(key) {
      return this.headers[key.toLowerCase()] || null;
    }
    
    has(key) {
      return key.toLowerCase() in this.headers;
    }
    
    set(key, value) {
      this.headers[key.toLowerCase()] = value;
    }
    
    delete(key) {
      delete this.headers[key.toLowerCase()];
    }
    
    forEach(callback, thisArg) {
      Object.keys(this.headers).forEach(key => {
        callback.call(thisArg, this.headers[key], key, this);
      });
    }
  };
}

// Mock XMLHttpRequest if it doesn't exist
if (typeof global.XMLHttpRequest === 'undefined') {
  global.XMLHttpRequest = class XMLHttpRequest {
    constructor() {
      this.readyState = 0;
      this.status = 0;
      this.statusText = '';
      this.response = null;
      this.responseText = '';
      this.responseType = '';
      this.responseURL = '';
      this.onreadystatechange = null;
      this.onload = null;
      this.onerror = null;
    }
    
    open(method, url, async = true, username = null, password = null) {
      this.method = method;
      this.url = url;
      this.async = async;
      this.username = username;
      this.password = password;
      this.readyState = 1;
      if (this.onreadystatechange) this.onreadystatechange();
    }
    
    send(body = null) {
      this.body = body;
      this.readyState = 4;
      this.status = 200;
      this.statusText = 'OK';
      this.response = '{}';
      this.responseText = '{}';
      if (this.onreadystatechange) this.onreadystatechange();
      if (this.onload) this.onload();
    }
    
    setRequestHeader(header, value) {
      if (!this.headers) this.headers = {};
      this.headers[header] = value;
    }
    
    getResponseHeader(header) {
      if (!this.responseHeaders) this.responseHeaders = { 'content-type': 'application/json' };
      return this.responseHeaders[header.toLowerCase()] || null;
    }
    
    getAllResponseHeaders() {
      if (!this.responseHeaders) this.responseHeaders = { 'content-type': 'application/json' };
      return Object.keys(this.responseHeaders)
        .map(key => `${key}: ${this.responseHeaders[key]}`)
        .join('\r\n');
    }
  };
}
