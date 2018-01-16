<script type="text/javascript">
function yesnoCheck() {
    if (document.getElementById('yesCheck').checked) {
        document.getElementById('ifYes').style.visibility = 'visible';
    }
    else {
    document.getElementById('ifYes').style.visibility = 'hidden';
    document.getElementById('yes').value='';
    document.getElementById('yes').placeholder='Millanen muu?';
    }
}
</script>