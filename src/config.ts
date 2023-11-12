interface Config {
  mongoUrl: string,
  secretKey: string
}

export const config: Config = {
  mongoUrl: 'mongodb://tester:' + encodeURIComponent("KwO9?$/q@HhZEf?PPzwM") + '@127.0.0.1:27017/test?authSource=admin',
  secretKey: "hdo87q2iurbv*&twt^*DTA7E6OaiuHCD" // <--- Product of randomly smashing my keyboard
};