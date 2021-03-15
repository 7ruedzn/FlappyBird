// -------------------------------------CRIA UM NOVO ELEMENTO--------------------------------------------------
const newElement = (className, selector) => {
    const element = document.createElement(selector)
    element.classList.add(className)
    return element
}

// ----------------------------------CRIA PIPE NORMAL OU INVERSO--------------------------------------
function Pipe(reverse = false) {
    this.element = newElement('pipe', 'div')

    const pipeHead = newElement('pipeHead', 'div')
    const pipeBody = newElement('pipeBody', 'div')

    if(reverse){
        this.element.appendChild(pipeBody)
        this.element.appendChild(pipeHead)
    }else{
        this.element.appendChild(pipeHead)
        this.element.appendChild(pipeBody)
    }

    // define a altura do pipe a partir da altura passada como param
    this.setPipeHeight = height => pipeBody.style.height = `${height}px`
}
            
// -----------------------------------CRIA PAR DE PIPES---------------------------------------------
function PipesPair(height, distanceBetween, x){
    this.element = newElement('pipesPair', 'div')

    this.superiorPipe = new Pipe(true)
    this.inferiorPipe = new Pipe(false)

    this.element.appendChild(this.superiorPipe.element)
    this.element.appendChild(this.inferiorPipe.element)

    // gera a altura entre os pipes e define a altura deles
    this.sortDistanceBetweenPipesY = () => {
        // calcula a altura dos pipes
        const superiorHeight = Math.random() * (height - distanceBetween)
        const inferiorHeight = height - distanceBetween - superiorHeight
        
        // define a altura dos pipes
        this.superiorPipe.setPipeHeight(superiorHeight)
        this.inferiorPipe.setPipeHeight(inferiorHeight)
    }
    // pegando o 'x' a partir do CSS utilizando split para pegar apenas o valor numérico
    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    // define o 'x' a partir do param passado
    this.setX = x => this.element.style.left = `${x}px` 
    // recebe a largura do to elemento
    this.getWidth = () => this.element.clientWidth
    // sorteando o espaço entre os pipes
    this.sortDistanceBetweenPipesY()
    // definindo o 'x' passado como param
    this.setX(x + 500)
}

// -------------------------CRIA O LOOP DE PIPES-----------------------------------------
function Pipes(height, distanceBetweenPipesY, width, distanceBetweenPipesX, scored) {
    // Pipes que vão ficar em loop na tela, porém mudando de altura
    // default = 4 pipes ; 1 - width ; 2 - w + dis ; dis * 2 ; dis * 3;
    this.pairsOfPipes = [
        new PipesPair(height, distanceBetweenPipesY, width),
        new PipesPair(height, distanceBetweenPipesY, width + distanceBetweenPipesX),
        new PipesPair(height, distanceBetweenPipesY, distanceBetweenPipesX * 2),
        new PipesPair(height, distanceBetweenPipesY, distanceBetweenPipesX * 3),
    ]

    // velocidade do jogo / 2 = slow; 3 = default; 4 > fast
    this.gameSpeed = 3;

    // gera a animação 
    this.animate = () => {
        this.pairsOfPipes.forEach(p => {
            p.setX(p.getX() - this.gameSpeed)

            // quando o par de 'pipes' sair da tela do jogo
            if(p.getX() < -p.getWidth()){
                // volta o pipe para o começo direita, realizando um loop
                // POSIÇÃO DE INÍCIO DO LOOP DO PIPE 4.7
                p.setX(p.getX() + distanceBetweenPipesX * 4.7)
                // sorteia novamente a distancia Y entre os pipes para
                // não se repetir a mesma distancia, já que é são utilizados
                // os mesmos 4 pipes durante todo o jogo
                p.sortDistanceBetweenPipesY()
            }

            // caso tenha passado pelo centro da tela, marcou ponto
            const middle = width / 2
            const crossedMiddle = p.getX() + this.gameSpeed >= middle 
            && p.getX() < middle
            if(crossedMiddle) scored()
        })
    }
}

// ------------------------------CRIAÇÃO E ANIMAÇÃO DO BIRD----------------------
function Bird(screenHeight){
    let flying = false

    this.element = newElement('bird', 'img')
    this.element.src = 'bird.png'

    // pega a altura do bird referente a altura que ele está do chão
    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    /*
    quando pressionando alguma tecla o bird está voando
    quando soltar ele está caindo
    */
    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    // Anima o bird em relação ao eixo Y
    this.animate = () => {
        // define o Y do passáro caso esteja pressionando uma tecla ou não
        // aumenta 8 pixels quando aperta e diminui 5 quando não pressiona
        const newY = this.getY() + (flying ? 6 : -5)
        const maxHeight = screenHeight - this.element.clientHeight
    
        //Condições para o pássaro não sair da tela do jogo
        if(newY <= 0){
           this.setY(0)
        } else if(newY >= maxHeight){
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }    
    }
    // Define o bird no meio da tela ao começar o jogo
    this.setY(screenHeight / 2)
}

// ------------------------CALCULA OS PONTOS----------------------------
function Score(){
    this.element = newElement('progress', 'span')
    // Atualiza o score a partir do param
    this.updateScore = score => this.element.innerHTML = score
    // Define o score inicial como 0
    this.updateScore(0)
}

function checkCollision(aElement, bElement){
    // Pegando as dimensões dos elementos passados como param
    const a = aElement.getBoundingClientRect()
    const b = bElement.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left 
    && b.left + b.width >= a.left
    
    const vertical = a.top + a.height >= b.top 
    && b.top + b.height >= a.top

    return horizontal && vertical
}

function collide(bird, pipes) {
    let collide = false

    // Checka se o bird colidiu com alguma barreira
    pipes.pairsOfPipes.forEach(p => {
        if(!collide){
            const superior = p.superiorPipe.element
            const inferior = p.inferiorPipe.element

            collide = checkCollision(bird.element, superior) 
            || checkCollision(bird.element, inferior)
        }
    })
    return collide
}

// -------------------------INICIA O JOGO-------------------------------
function StartGame() {
    // --------------------INSTANCIANDO ELEMENTOS------------------------------
    let points = 0
    const screen = document.querySelector('[flappy]')
    const bird = new Bird(screen.clientHeight)
    const score = new Score()
    const pipes = new Pipes(screen.clientHeight, 300, screen.clientWidth, 400, 
        () => score.updateScore(++points))
    // -----------------------INSERINDO NA TELA--------------------------------
    screen.appendChild(bird.element)
    screen.appendChild(score.element)
    pipes.pairsOfPipes.forEach(p => screen.appendChild(p.element))

    this.start = () => {
        const timer = setInterval(() => {
            pipes.animate()
            bird.animate()
            
            if(collide(bird, pipes)){
                clearInterval(timer)
            } 
        }, 20)
    }
}

new StartGame().start()