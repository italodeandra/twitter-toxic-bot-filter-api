export default function Autowired(target: any, key: any) {
    const Service = Reflect.getMetadata('design:type', target, key)
    target[key] = new Service()
}