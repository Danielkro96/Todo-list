

exports.getDate = function () {

  const today = new Date();

  const options = {
    weekday: 'long',
    month: '2-digit',
    day: 'numeric'
  };

  return today.toLocaleDateString("en-IL", options);

}


exports.getDay = function () {

  const today = new Date();

  const options = {
    weekday: 'long'
  };

  return today.toLocaleDateString("en-IL", options);

}
