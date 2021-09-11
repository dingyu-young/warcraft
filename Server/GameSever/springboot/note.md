##注解说明
- @Autowired: 自动装配通过类型->名字顺序查找bean
    如果Autowired装配的属性bean不唯一,则使用@Qualifier(value = "xx")
- @Nullable: 属性标记这个注解,说明这个属性可以为null
- @Resourece: 自动装配通过名字->类型顺序查找bean


- @Component 组件,放在类上,将类注入spring容器,即bean
    - 衍生:功能和@Component一样
        - dao: @Repository 
        - service: @Service
        - controller: @Controller
- @Value  类属性注入,放在属性或者set方法上

- @Scope 作用域:prototype, singleton


- @Configuration spring配置类,用java代码方式替代.xml配置


## AOP
- @Aspect 标注这个类是一个切面
- @Before("execution(* com.dy.springboot.*.*(..))")切面方法,在方法执行前调用