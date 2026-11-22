const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'app'));

files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts')).forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let modified = false;

  // Replace apiRequest<...>(`/api/...`)
  const regex1 = /apiRequest<([^>]+)>\(`\/api\//g;
  if (regex1.test(content)) {
    content = content.replace(regex1, 'apiRequest<$1>(`/');
    modified = true;
  }

  // Replace apiRequest<...>("/api/...")
  const regex2 = /apiRequest<([^>]+)>\("\/api\//g;
  if (regex2.test(content)) {
    content = content.replace(regex2, 'apiRequest<$1>("/');
    modified = true;
  }

  // Replace apiRequest(`/api/...`)
  const regex3 = /apiRequest\(`\/api\//g;
  if (regex3.test(content)) {
    content = content.replace(regex3, 'apiRequest(`/');
    modified = true;
  }

  // Replace apiRequest("/api/...")
  const regex4 = /apiRequest\("\/api\//g;
  if (regex4.test(content)) {
    content = content.replace(regex4, 'apiRequest("/');
    modified = true;
  }

  // Replace fetch("http://localhost:5000/api/...")
  const regex5 = /fetch\("http:\/\/localhost:5000\/api\//g;
  if (regex5.test(content)) {
    // Let's use the standard apiRequest instead if possible, or just fix it.
    // We can just import NEXT_PUBLIC_API_URL or change it to the base.
    // Actually, it's easier to just strip http://localhost:5000/api and use process.env
    content = content.replace(regex5, 'fetch(process.env.NEXT_PUBLIC_API_URL + "/');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
