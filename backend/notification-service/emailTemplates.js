// emailTemplates.js

exports.getEmailTemplate = (order) => {
    if (order.status === 'SHIPPED') {
      return {
        subject: `Your order ${order.id} has been shipped!`,
        text: `Hello,
  
  Your order with ID ${order.id} has been shipped. You can expect delivery within the next few days.
  
  Thank you for shopping with us!
  
  Best regards,
  E-commerce Team
        `
      };
    }
  
    // Add more templates based on order status if needed
  
    return {
      subject: `Update on your order ${order.id}`,
      text: `Hello,
  
  There is an update on your order with ID ${order.id}. Current status: ${order.status}.
  
  Best regards,
  E-commerce Team
      `
    };
  };
  