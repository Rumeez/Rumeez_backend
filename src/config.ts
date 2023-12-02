interface Config {
  mongoUrl: string,
  secretKey: string
}

export const config: Config = {
  //production database
  mongoUrl: 'mongodb://rumeez-backend:' + encodeURIComponent("c*In4,><mFDmGF^lsLM{") + '@127.0.0.1:27017/rumeez?authSource=admin',

  //testing database
  //mongoUrl: 'mongodb://tester:' + encodeURIComponent("KwO9?$/q@HhZEf?PPzwM") + '@127.0.0.1:27017/test?authSource=admin',
 
  //Andrea's database
  // mongoUrl: 'mongodb://andrea-tester:' + encodeURIComponent("$O@USbh[L2]]e[}Fuiwf") + '@127.0.0.1:27017/andrea-test?authSource=admin',

  secretKey: "hdo87q2iurbv*&twt^*DTA7E6OaiuHCD" // <--- Product of randomly smashing my keyboard
};