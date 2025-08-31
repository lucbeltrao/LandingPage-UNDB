// Função para aplicar o efeito de fade-in aos elementos
function fadeInElements() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    // Função para verificar se um elemento está visível na viewport
    const isElementInViewport = (el) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    };
    
    // Função para verificar e aplicar o efeito de fade-in
    const checkFade = () => {
        fadeElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('active');
            }
        });
    };
    
    // Verificar elementos visíveis no carregamento inicial
    checkFade();
    
    // Verificar elementos visíveis durante o scroll
    window.addEventListener('scroll', checkFade);
}

// Função para controlar o player de áudio
function initAudioPlayer() {
    const audio = document.getElementById('audio');
    const playBtn = document.getElementById('play-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('volume-icon');
    const progressBar = document.querySelector('.progress');
    const progressContainer = document.querySelector('.progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const audioPlayer = document.getElementById('audio-player');
    
    // Variáveis para arrastar o player
    let isDragging = false;
    let offsetX, offsetY;
    
    // Função para formatar o tempo em minutos:segundos
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };
    
    // Atualizar o ícone do botão de play/pause
    const updatePlayIcon = () => {
        if (audio.paused) {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    };
    
    // Atualizar o ícone de volume baseado no nível
    const updateVolumeIcon = () => {
        const volume = audio.volume;
        if (volume >= 0.6) {
            volumeIcon.className = 'fas fa-volume-up';
        } else if (volume >= 0.1) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-mute';
        }
    };
    
    // Atualizar a barra de progresso
    const updateProgress = () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    };
    
    // Definir a duração quando os metadados estiverem carregados
    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });
    
    // Atualizar o progresso enquanto a música toca
    audio.addEventListener('timeupdate', updateProgress);
    
    // Play/Pause quando o botão for clicado
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
        updatePlayIcon();
    });
    
    // Atualizar o volume quando o slider for ajustado
    volumeSlider.addEventListener('input', () => {
        const volume = volumeSlider.value / 100;
        audio.volume = volume;
        updateVolumeIcon();
    });
    
    // Mutar/Desmutar quando o ícone de volume for clicado
    volumeIcon.addEventListener('click', () => {
        if (audio.volume > 0) {
            audio.dataset.prevVolume = audio.volume;
            audio.volume = 0;
            volumeSlider.value = 0;
        } else {
            audio.volume = audio.dataset.prevVolume || 0.7;
            volumeSlider.value = audio.volume * 100;
        }
        updateVolumeIcon();
    });
    
    // Permitir clicar e arrastar na barra de progresso para pular para um ponto específico
    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        
        audio.currentTime = (clickX / width) * duration;
    });
    
    // Adicionar funcionalidade de arrastar na barra de progresso
    let isSeekDragging = false;
    
    progressContainer.addEventListener('mousedown', (e) => {
        isSeekDragging = true;
        updateSeekPosition(e);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isSeekDragging) {
            updateSeekPosition(e);
        }
    });
    
    document.addEventListener('mouseup', () => {
        isSeekDragging = false;
    });
    
    function updateSeekPosition(e) {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = progressContainer.clientWidth;
        let percent = clickX / width;
        
        // Limitar entre 0 e 1
        percent = Math.max(0, Math.min(1, percent));
        
        // Atualizar visualmente a barra de progresso
        progressBar.style.width = `${percent * 100}%`;
        
        // Atualizar o tempo atual
        const newTime = percent * audio.duration;
        audio.currentTime = newTime;
        currentTimeEl.textContent = formatTime(newTime);
    }
    
    // Tornar o player arrastável
    audioPlayer.addEventListener('mousedown', (e) => {
        // Verificar se o clique não foi em um controle interativo
        if (e.target.closest('.control-btn, .progress-bar, .volume-slider-container, #volume-icon')) {
            return;
        }
        
        isDragging = true;
        
        // Calcular o offset do mouse em relação ao player
        const rect = audioPlayer.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Adicionar classe para indicar que está sendo arrastado
        audioPlayer.classList.add('dragging');
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            // Calcular a nova posição
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            
            // Aplicar a nova posição
            audioPlayer.style.left = `${x}px`;
            audioPlayer.style.top = `${y}px`;
            audioPlayer.style.bottom = 'auto';
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            audioPlayer.classList.remove('dragging');
        }
    });
    
    // Quando a música terminar
    audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        audio.pause();
        updatePlayIcon();
    });
    
    // Inicializar o volume
    audio.volume = volumeSlider.value / 100;
    updateVolumeIcon();
    
    // Tentar carregar a duração inicial
    if (audio.readyState > 0) {
        durationEl.textContent = formatTime(audio.duration);
    }
}

// Função para adicionar efeito de parallax ao fundo
function parallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        document.querySelector('.overlay').style.transform = `translateY(${scrollPosition * 0.5}px)`;
    });
}

// Função para mudar o estilo do header durante o scroll
function headerScrollEffect() {
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            header.style.padding = '15px 50px';
        } else {
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            header.style.padding = '20px 50px';
        }
    });
}

// Função para adicionar efeito de hover aos cards dos membros
function memberCardEffect() {
    const memberCards = document.querySelectorAll('.member-card');
    
    memberCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.backgroundColor = 'rgba(50, 50, 50, 0.8)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.backgroundColor = 'rgba(40, 40, 40, 0.7)';
        });
    });
}

// Função para scroll suave nos links de navegação
function smoothScrollLinks() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });
}

// Inicializar todas as funções quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Aplicar efeito de fade-in inicial com um pequeno atraso para melhor experiência
    setTimeout(fadeInElements, 100);
    
    // Inicializar outros efeitos
    parallaxEffect();
    headerScrollEffect();
    memberCardEffect();
    smoothScrollLinks();
    initAudioPlayer();
    
    // Adicionar classe active aos elementos que devem ser visíveis imediatamente
    document.querySelector('header').classList.add('active');
    document.querySelector('.audio-player').classList.add('active');
});