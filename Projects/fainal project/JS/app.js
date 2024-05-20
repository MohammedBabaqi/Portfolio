$(document).ready(function() {
    $('.next').click(function() {
    
        const current_img = $('.show');
        const next_img = current_img.next();
        const current_dote = $('.active');
        const next_dote = current_dote.next();
    
        if (next_img.length)
        {
        current_img.fadeOut().removeClass('show');
        next_img.fadeIn().addClass('show');
        current_dote.removeClass('active');
        next_dote.addClass('active');
        } 

  else 
    {
       
        current_img.fadeOut().removeClass('show');
        $(".img_slide img:first-child").fadeIn().addClass('show');
        current_dote.removeClass('active');
        $(".dots li:first-child").addClass('active');
      }
    });
  
    let refreshInterval = setInterval(function() {
      $('.next').trigger('click');
    }, 5000);
  
    $('.prev').click(function() {
      const current_img = $('.show');
      const prev_img = current_img.prev();
      const current_dote = $('.active');
      const prev_dote = current_dote.prev();
      if (prev_img.length) {
        current_img.fadeOut().removeClass('show');
        prev_img.fadeIn().addClass('show');
        current_dote.removeClass('active');
        prev_dote.addClass('active');
      } else {
        current_img.fadeOut().removeClass('show');
        $(".img_slide img:last-child").fadeIn().addClass('show');
        current_dote.removeClass('active');
        $(".dots li:last-child").addClass('active');
    }

    });

  });
