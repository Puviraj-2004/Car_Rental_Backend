(async () => {
  try {
    const res = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation Login($input: LoginInput!) { login(input: $input) { token user { id email role } } }`,
        variables: { input: { email: 'admin@carrental.com', password: 'Admin@123456' } }
      })
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
})();